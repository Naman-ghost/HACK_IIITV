from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import csv
import io
from werkzeug.utils import secure_filename
from datetime import datetime
import joblib



app = Flask(__name__)
CORS(app)

# Database connection config
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '12345678',
    'database': 'smartretail'
}

@app.route("/")
def home():
    return "SmartRetail Backend is running."

import pandas as pd
# predict demand 
model = joblib.load("model.pkl")
@app.route("/predict_demand", methods=["GET"])
def predict_demand():
    if model is None:
        return jsonify({"error": "ML model not loaded"}), 500
    try:
        product_id = int(request.args.get("product_id"))
        month = int(request.args.get("month"))
        week = int(request.args.get("week"))

        df = pd.DataFrame([{
            "product_id": product_id,
            "month": month,
            "week": week
        }])

        prediction = model.predict(df)[0]
        return jsonify({
            "product_id": product_id,
            "month": month,
            "week": week,
            "predicted_demand": round(prediction)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/schemes")
def get_schemes():
    schemes = [
        {
            "name": "Pradhan Mantri MUDRA Yojana (PMMY)",
            "description": "Collateral-free loans up to ₹10 lakh for micro/small businesses including grocery shops.",
            "link": "https://www.mudra.org.in/",
            "category": "Finance",
            "icon": "💰",
            "type": "Retail"
        },
        {
            "name": "Stand-Up India Scheme",
            "description": "Loans from ₹10 lakh to ₹1 crore for women and SC/ST entrepreneurs in retail sectors.",
            "link": "https://www.standupmitra.in/",
            "category": "Women-focused",
            "icon": "👩‍💼",
            "type": "Retail"
        },
        {
            "name": "PM Formalization of Micro Food Processing Enterprises (PMFME)",
            "description": "Support for local food processing businesses, great for grocery chains and kirana stores.",
            "link": "https://mofpi.nic.in/pmfme/",
            "category": "Food/Agri",
            "icon": "🍱",
            "type": "Food Retail"
        },
        {
            "name": "National Small Industries Corporation (NSIC) Subsidy",
            "description": "Marketing and credit support for small retail businesses like supermarkets.",
            "link": "https://www.nsic.co.in/",
            "category": "Finance",
            "icon": "🏬",
            "type": "Retail"
        },
        {
            "name": "MSME Competitive Lean Scheme",
            "description": "Encourages lean manufacturing practices even in grocery storage and supply chain.",
            "link": "https://dcmsme.gov.in/CLCS_TUS.htm",
            "category": "Operations",
            "icon": "📦",
            "type": "Retail"
        },
        {
            "name": "Market Development Assistance Scheme",
            "description": "Helps MSMEs participate in trade fairs and get marketing support.",
            "link": "https://msme.gov.in/",
            "category": "Marketing",
            "icon": "📢",
            "type": "Retail"
        },
        {
            "name": "Digital MSME Scheme",
            "description": "Promotes digital tools and cloud-based solutions for MSMEs including retail.",
            "link": "https://msme.gov.in/",
            "category": "Technology",
            "icon": "💻",
            "type": "Retail Tech"
        },
        {
            "name": "SIDBI Make in India Soft Loan Fund for Micro Small and Medium Enterprises (SMILE)",
            "description": "Soft loans for new and existing MSMEs including supermarkets to upgrade.",
            "link": "https://www.sidbi.in/",
            "category": "Finance",
            "icon": "📈",
            "type": "Retail"
        },
        {
            "name": "Credit Linked Capital Subsidy Scheme (CLCSS)",
            "description": "Subsidy for technology upgrades including POS and billing systems in grocery stores.",
            "link": "https://www.dcmsme.gov.in/schemes/sccr.htm",
            "category": "Tech Upgrade",
            "icon": "🧾",
            "type": "Retail Tech"
        }
    ]
    return jsonify(schemes)

@app.route("/analytics")
def analytics():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT p.name, c.name AS category, SUM(s.quantity) AS sales
            FROM sales s
            JOIN products p ON s.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            GROUP BY p.id
            ORDER BY sales DESC
            LIMIT 5
        """)
        top_products = cursor.fetchall()

        cursor.execute("""
            SELECT c.name, COUNT(p.id) AS count
            FROM categories c
            LEFT JOIN products p ON p.category_id = c.id
            GROUP BY c.id
        """)
        categories = cursor.fetchall()

        cursor.execute("""
            SELECT DATE_FORMAT(s.sale_date, '%%Y-%%m') AS month, SUM(s.quantity) AS total
            FROM sales s
            GROUP BY month
            ORDER BY month
        """)
        monthly_sales = cursor.fetchall()

        cursor.execute("""
            SELECT p.name, c.name AS category, SUM(b.quantity) AS inventory
            FROM product_inventory_batches b
            JOIN products p ON b.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            GROUP BY p.id, c.name
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
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals() and conn.is_connected(): conn.close()

@app.route("/products", methods=["GET"])
def get_products():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM products")
        products = cursor.fetchall()
        return jsonify(products)
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals() and conn.is_connected(): conn.close()

@app.route("/products", methods=["POST"])
def add_product():
    try:
        data = request.get_json()
        required_fields = ["name", "category_id", "price", "inventory"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO products (name, category_id, price, inventory)
            VALUES (%s, %s, %s, %s)
        """, (data["name"], data["category_id"], data["price"], data["inventory"]))
        conn.commit()
        return jsonify({"message": "Product added"})
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals() and conn.is_connected(): conn.close()

@app.route("/products/<int:id>", methods=["DELETE"])
def delete_product(id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM products WHERE id = %s", (id,))
        conn.commit()
        return jsonify({"message": "Product deleted"})
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals() and conn.is_connected(): conn.close()


# INVENTORY



@app.route("/inventory/upload_csv", methods=["POST"])
def upload_inventory_csv():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty file name"}), 400

    filename = secure_filename(file.filename)
    stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
    csv_input = csv.DictReader(stream)

    inserted = 0
    for row in csv_input:
        try:
            product_id = int(row["product_id"])
            quantity = int(row["quantity"])
            expiry_date = datetime.strptime(row["expiry_date"], "%Y-%m-%d").date()
            supplier_name = row["supplier_name"]
            order_date = datetime.strptime(row["order_date"], "%Y-%m-%d").date()
            delivery_date = datetime.strptime(row["delivery_date"], "%Y-%m-%d").date()

            cur = mysql.connection.cursor()
            cur.execute("""
                INSERT INTO product_inventory_batches
                (product_id, quantity, expiry_date, supplier_name, order_date, delivery_date)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (product_id, quantity, expiry_date, supplier_name, order_date, delivery_date))

            # Update inventory count in `products`
            cur.execute("""
                UPDATE products
                SET inventory = inventory + %s
                WHERE id = %s
            """, (quantity, product_id))

            mysql.connection.commit()
            cur.close()
            inserted += 1

        except Exception as e:
            print(f"Error in row {row}: {e}")
            mysql.connection.rollback()
            continue

    return jsonify({"message": f"Inserted {inserted} rows successfully"}), 200



@app.route("/inventory", methods=["GET"])
def get_inventory():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT 
  b.id AS batch_id,
  p.name AS product_name,
  c.name AS category,
  b.quantity,
  b.expiry_date,
  b.supplier_name
FROM product_inventory_batches b
JOIN products p ON b.product_id = p.id
JOIN categories c ON p.category_id = c.id
ORDER BY b.expiry_date ASC;
        """)
        data = cursor.fetchall()
        return jsonify(data)
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals() and conn.is_connected(): conn.close()

@app.route("/inventory", methods=["POST"])
def add_inventory():
    try:
        data = request.get_json()
        fields = ["product_id", "quantity", "expiry_date", "supplier_name", "order_date", "delivery_date"]
        for field in fields:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO product_inventory_batches (product_id, quantity, expiry_date, supplier_name, order_date, delivery_date)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            data["product_id"], data["quantity"], data["expiry_date"],
            data["supplier_name"], data["order_date"], data["delivery_date"]
        ))
        conn.commit()
        return jsonify({"message": "Inventory added"})
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals() and conn.is_connected(): conn.close()

@app.route("/inventory/reduce", methods=["POST"])
def reduce_inventory_quantity():
    try:
        data = request.get_json()
        inventory_id = data.get("inventory_id")
        qty_to_reduce = data.get("quantity")

        if not inventory_id or not qty_to_reduce:
            return jsonify({"error": "Missing inventory_id or quantity"}), 400

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT quantity FROM product_inventory_batches WHERE id = %s", (inventory_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({"error": "Inventory entry not found"}), 404

        current_qty = row[0]
        if qty_to_reduce > current_qty:
            return jsonify({"error": "Not enough quantity to reduce"}), 400
        elif qty_to_reduce == current_qty:
            cursor.execute("DELETE FROM product_inventory_batches WHERE id = %s", (inventory_id,))
        else:
            cursor.execute("UPDATE product_inventory_batches SET quantity = quantity - %s WHERE id = %s", (qty_to_reduce, inventory_id))

        conn.commit()
        return jsonify({"message": "Inventory updated"})
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals() and conn.is_connected(): conn.close()

@app.route("/inventory/<int:product_id>", methods=["GET"])
def get_inventory_by_product(product_id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM product_inventory_batches
            WHERE product_id = %s AND quantity > 0
            ORDER BY expiry_date ASC
        """, (product_id,))
        batches = cursor.fetchall()
        return jsonify(batches)
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals() and conn.is_connected(): conn.close()




#           SALES





@app.route("/sales/sell", methods=["POST"])
def sell_product():
    try:
        data = request.get_json()
        user_id = data['user_id']
        product_id = data['product_id']
        quantity = data['quantity']
        sale_date = datetime.now().date()

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT * FROM product_inventory_batches
            WHERE product_id = %s AND quantity > 0
            ORDER BY expiry_date ASC
        """, (product_id,))
        batches = cursor.fetchall()

        remaining_qty = quantity
        for batch in batches:
            if remaining_qty <= 0:
                break

            batch_qty = batch['quantity']
            deduct = min(batch_qty, remaining_qty)

            cursor.execute("""
                UPDATE product_inventory_batches
                SET quantity = quantity - %s
                WHERE id = %s
            """, (deduct, batch['id']))

            cursor.execute("""
                INSERT INTO sales (user_id, product_id, quantity, sale_date, batch_id)
                VALUES (%s, %s, %s, %s, %s)
            """, (user_id, product_id, deduct, sale_date, batch['id']))

            remaining_qty -= deduct

        conn.commit()
        return jsonify({"message": "Sale recorded", "unsold_quantity": remaining_qty})
    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500
    finally:
        if 'cursor' in locals(): cursor.close()
        if 'conn' in locals() and conn.is_connected(): conn.close()




# INVOICE   

@app.route("/create-invoice", methods=["POST"])
def create_invoice():
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        items = data.get("items", [])

        if not user_id or not isinstance(items, list) or not items:
            return jsonify({"error": "Invalid request. 'user_id' and 'items' are required."}), 400

        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        for item in items:
            product_id = item.get("product_id")
            qty_needed = int(item.get("quantity", 0))

            if not product_id or qty_needed <= 0:
                continue  # skip invalid entry

            # Fetch available batches sorted by earliest expiry date
            cursor.execute("""
                SELECT id, quantity 
                FROM product_inventory_batches 
                WHERE product_id = %s AND quantity > 0 
                ORDER BY expiry_date ASC
            """, (product_id,))
            batches = cursor.fetchall()

            for batch_id, batch_qty in batches:
                if qty_needed <= 0:
                    break

                used_qty = min(batch_qty, qty_needed)

                # Insert sale
                cursor.execute("""
                    INSERT INTO sales (user_id, product_id, quantity, sale_date, batch_id)
                    VALUES (%s, %s, %s, %s, %s)
                """, (user_id, product_id, used_qty, datetime.today().date(), batch_id))

                # Update inventory
                cursor.execute("""
                    UPDATE product_inventory_batches 
                    SET quantity = quantity - %s 
                    WHERE id = %s
                """, (used_qty, batch_id))

                qty_needed -= used_qty

            if qty_needed > 0:
                conn.rollback()
                return jsonify({"error": f"Insufficient stock for product ID {product_id}"}), 400

        conn.commit()
        return jsonify({"message": "Invoice created successfully"}), 200

    except mysql.connector.Error as err:
        return jsonify({"error": str(err)}), 500

    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals() and conn.is_connected():
            conn.close()





if __name__ == "__main__":
    app.run(debug=True)