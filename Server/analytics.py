# backend/app.py
from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '12345678',
    'database': 'smartretail'
}

@app.route("/")
def home():
    return "SmartRetail Backend is running."

@app.route("/analytics")
def analytics():
    conn = None
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        # Top products
        cursor.execute("""
            SELECT p.name, p.category, SUM(s.quantity) as sales
            FROM sales s
            JOIN products p ON s.product_id = p.id
            GROUP BY p.id
            ORDER BY sales DESC
            LIMIT 5
        """)
        top_products = cursor.fetchall()

        # Category distribution
        cursor.execute("""
            SELECT p.category as name, COUNT(*) as count
            FROM products p
            GROUP BY p.category
        """)
        categories = cursor.fetchall()

        # Monthly sales
        cursor.execute("""
            SELECT DATE_FORMAT(s.date, '%%Y-%%m') as month, SUM(s.quantity) as total
            FROM sales s
            GROUP BY month
            ORDER BY month
        """)
        monthly_sales = cursor.fetchall()

        # Inventory levels
        cursor.execute("""
            SELECT name, category, inventory FROM products
        """)
        inventory = cursor.fetchall()

        return jsonify({
            "top_products": top_products,
            "categories": categories,
            "monthly_sales": monthly_sales,
            "inventory": inventory
        })

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        if conn and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    app.run(debug=True)
