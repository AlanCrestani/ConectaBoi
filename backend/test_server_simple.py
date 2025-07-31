#!/usr/bin/env python3
"""
Script simples para testar o servidor Flask
"""

from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/health')
def health_check():
    return jsonify({
        "status": "ok",
        "message": "Servidor funcionando!",
        "timestamp": "2025-07-30"
    })

@app.route('/')
def home():
    return jsonify({
        "message": "ConectaBoi Insight - API Funcionando!",
        "version": "1.0.0"
    })

if __name__ == "__main__":
    print("🚀 Iniciando servidor de teste...")
    print("📡 Health check: http://localhost:8000/api/health")
    print("🏠 Home: http://localhost:8000/")
    app.run(debug=True, port=8000, host='0.0.0.0') 