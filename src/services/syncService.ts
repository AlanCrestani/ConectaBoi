import { supabase } from "@/integrations/supabase/client";

export interface SyncUploadRequest {
  device_id: string;
  batch_id: string;
  app_version: string;
  data: Array<{
    table: string;
    operation: "insert" | "update" | "delete";
    offline_id: string;
    checksum: string;
    local_timestamp: string;
    record: Record<string, any>;
  }>;
}

export interface SyncUploadResponse {
  success: boolean;
  processed_items: number;
  results: Array<{
    offline_id: string;
    server_id: string;
    status: "inserted" | "updated" | "deleted" | "error";
    created_at?: string;
    error_message?: string;
  }>;
  server_timestamp: string;
}

export interface SyncDownloadRequest {
  since: number;
  device_id: string;
}

export interface SyncDownloadResponse {
  updates: Array<{
    record_id: string;
    table_name: string;
    operation: "insert" | "update" | "delete";
    data: Record<string, any>;
    server_timestamp: number;
    checksum: string;
  }>;
  server_timestamp: number;
  has_more: boolean;
  next_page_token?: string;
}

export interface ActivityLogRequest {
  device_id: string;
  batch_id: string;
  activities: Array<{
    action: string;
    table_affected?: string;
    record_id?: string;
    timestamp_local: string;
    success: boolean;
    network_type: "wifi" | "mobile_data" | "offline";
    app_version: string;
    os_version?: string;
    details?: string;
    error_details?: string;
    retry_count?: number;
  }>;
}

export interface ActivityLogResponse {
  success: boolean;
  logged_activities: number;
  server_timestamp: string;
}

export interface DeviceStatusResponse {
  device: {
    device_id: string;
    is_authorized: boolean;
    last_sync: string | null;
    pending_approvals: number;
    storage_quota_mb: number;
    storage_used_mb: number;
  };
  sync_config: {
    sync_interval_minutes: number;
    auto_sync_on_wifi: boolean;
    auto_sync_on_mobile_data: boolean;
    batch_size: number;
    max_retry_attempts: number;
    offline_limit_days: number;
    enable_photo_sync: boolean;
    max_photo_size_mb: number;
  };
  server_info: {
    server_time: string;
    maintenance_mode: boolean;
    min_app_version: string;
  };
}

class SyncService {
  // Upload de dados do mobile para o servidor
  async uploadData(request: SyncUploadRequest): Promise<SyncUploadResponse> {
    try {
      const { data, error } = await supabase.from("sync_queue").insert(
        request.data.map((item) => ({
          device_id: request.device_id,
          table_name: item.table,
          operation: item.operation,
          data: item.record,
          offline_id: item.offline_id,
          checksum: item.checksum,
          local_timestamp: item.local_timestamp,
          status: "pending",
          batch_id: request.batch_id,
          app_version: request.app_version,
        }))
      );

      if (error) throw error;

      // Processar os dados inseridos
      const results = await this.processSyncQueue(request.batch_id);

      return {
        success: true,
        processed_items: results.length,
        results: results.map((result) => ({
          offline_id: result.offline_id,
          server_id: result.server_id || result.offline_id,
          status: result.status as any,
          created_at: result.created_at,
          error_message: result.error_message,
        })),
        server_timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Erro no upload de dados:", error);
      return {
        success: false,
        processed_items: 0,
        results: [],
        server_timestamp: new Date().toISOString(),
      };
    }
  }

  // Download de atualizações do servidor para o mobile
  async downloadUpdates(
    request: SyncDownloadRequest
  ): Promise<SyncDownloadResponse> {
    try {
      // Buscar atualizações desde o timestamp fornecido
      const { data: updates, error } = await supabase
        .from("mobile_activity_log")
        .select("*")
        .gte("timestamp_server", new Date(request.since).toISOString())
        .neq("device_id", request.device_id) // Não incluir logs do próprio dispositivo
        .order("timestamp_server", { ascending: true })
        .limit(100);

      if (error) throw error;

      // Converter logs em formato de atualizações
      const formattedUpdates = (updates || []).map((update) => ({
        record_id: update.record_id || update.id,
        table_name: update.table_affected || "mobile_activity_log",
        operation: "update" as const,
        data: {
          id: update.id,
          action: update.action,
          success: update.success,
          timestamp_server: update.timestamp_server,
          error_details: update.error_details,
        },
        server_timestamp: new Date(update.timestamp_server).getTime(),
        checksum: this.generateChecksum(update),
      }));

      return {
        updates: formattedUpdates,
        server_timestamp: Date.now(),
        has_more: formattedUpdates.length >= 100,
        next_page_token:
          formattedUpdates.length >= 100 ? "next_page" : undefined,
      };
    } catch (error) {
      console.error("Erro no download de atualizações:", error);
      return {
        updates: [],
        server_timestamp: Date.now(),
        has_more: false,
      };
    }
  }

  // Log de atividades do mobile
  async logActivity(request: ActivityLogRequest): Promise<ActivityLogResponse> {
    try {
      const { data, error } = await supabase.from("mobile_activity_log").insert(
        request.activities.map((activity) => ({
          device_id: request.device_id,
          action: activity.action,
          table_affected: activity.table_affected,
          record_id: activity.record_id,
          timestamp_local: activity.timestamp_local,
          timestamp_server: new Date().toISOString(),
          success: activity.success,
          network_type: activity.network_type,
          app_version: activity.app_version,
          os_version: activity.os_version,
          details: activity.details,
          error_details: activity.error_details,
          retry_count: activity.retry_count || 0,
          batch_id: request.batch_id,
        }))
      );

      if (error) throw error;

      return {
        success: true,
        logged_activities: request.activities.length,
        server_timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Erro ao logar atividades:", error);
      return {
        success: false,
        logged_activities: 0,
        server_timestamp: new Date().toISOString(),
      };
    }
  }

  // Status do dispositivo
  async getDeviceStatus(deviceId: string): Promise<DeviceStatusResponse> {
    try {
      // Buscar informações do dispositivo
      const { data: device, error: deviceError } = await supabase
        .from("mobile_devices")
        .select("*")
        .eq("device_id", deviceId)
        .single();

      if (deviceError) throw deviceError;

      // Buscar configurações do confinamento
      const { data: config, error: configError } = await supabase
        .from("mobile_config")
        .select("*")
        .eq("confinamento_id", device.confinamento_id)
        .single();

      if (configError) throw configError;

      return {
        device: {
          device_id: device.device_id,
          is_authorized: device.is_active,
          last_sync: device.last_sync,
          pending_approvals: 0, // Mockado por enquanto
          storage_quota_mb: 100,
          storage_used_mb: 15.7,
        },
        sync_config: {
          sync_interval_minutes: config.sync_interval_minutes || 30,
          auto_sync_on_wifi: config.auto_sync_on_wifi || true,
          auto_sync_on_mobile_data: config.auto_sync_on_mobile_data || false,
          batch_size: config.batch_size || 50,
          max_retry_attempts: config.max_retry_attempts || 3,
          offline_limit_days: config.offline_limit_days || 7,
          enable_photo_sync: config.enable_photo_sync || true,
          max_photo_size_mb: config.max_photo_size_mb || 5,
        },
        server_info: {
          server_time: new Date().toISOString(),
          maintenance_mode: false,
          min_app_version: "1.0.0",
        },
      };
    } catch (error) {
      console.error("Erro ao buscar status do dispositivo:", error);
      throw error;
    }
  }

  // Processar fila de sincronização
  private async processSyncQueue(batchId: string) {
    try {
      // Buscar itens da fila
      const { data: queueItems, error } = await supabase
        .from("sync_queue")
        .select("*")
        .eq("batch_id", batchId)
        .eq("status", "pending");

      if (error) throw error;

      const results = [];

      for (const item of queueItems || []) {
        try {
          let serverId = null;
          let status = "error";

          // Processar baseado na operação
          switch (item.operation) {
            case "insert":
              if (item.table_name === "combustivel_lancamentos") {
                const { data: inserted, error: insertError } = await supabase
                  .from("combustivel_lancamentos")
                  .insert({
                    ...item.data,
                    mobile_created_at: item.local_timestamp,
                    mobile_synced_at: new Date().toISOString(),
                    sync_status: "synced",
                    device_id: item.device_id,
                  })
                  .select("id")
                  .single();

                if (!insertError && inserted) {
                  serverId = inserted.id;
                  status = "inserted";
                }
              }
              break;

            case "update":
              if (item.table_name === "combustivel_lancamentos") {
                const { error: updateError } = await supabase
                  .from("combustivel_lancamentos")
                  .update({
                    ...item.data,
                    mobile_synced_at: new Date().toISOString(),
                    sync_status: "synced",
                  })
                  .eq("id", item.data.id);

                if (!updateError) {
                  serverId = item.data.id;
                  status = "updated";
                }
              }
              break;

            case "delete":
              if (item.table_name === "combustivel_lancamentos") {
                const { error: deleteError } = await supabase
                  .from("combustivel_lancamentos")
                  .delete()
                  .eq("id", item.data.id);

                if (!deleteError) {
                  status = "deleted";
                }
              }
              break;
          }

          // Atualizar status na fila
          await supabase
            .from("sync_queue")
            .update({
              status: status === "error" ? "error" : "processed",
              processed_at: new Date().toISOString(),
              server_id: serverId,
            })
            .eq("id", item.id);

          results.push({
            offline_id: item.offline_id,
            server_id: serverId,
            status,
            created_at: new Date().toISOString(),
            error_message:
              status === "error" ? "Falha no processamento" : undefined,
          });
        } catch (itemError) {
          console.error("Erro ao processar item da fila:", itemError);
          results.push({
            offline_id: item.offline_id,
            server_id: null,
            status: "error",
            created_at: new Date().toISOString(),
            error_message: itemError.message,
          });
        }
      }

      return results;
    } catch (error) {
      console.error("Erro ao processar fila de sincronização:", error);
      return [];
    }
  }

  // Gerar checksum para validação
  private generateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }
}

export const syncService = new SyncService();
