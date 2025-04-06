from flask import Flask, request, jsonify
import joblib
import pandas as pd

app = Flask(__name__)

# Load the trained model
model = joblib.load("model.pkl")

# Function to encode season
def get_season_encoded(month):
    if month in [12, 1, 2]:
        return 0  # Winter
    elif month in [3, 4, 5]:
        return 1  # Spring
    elif month in [6, 7, 8]:
        return 2  # Summer
    else:
        return 3  # Autumn

@app.route("/")
def home():
    return "SmartRetail Demand Forecast API is live. Use /predict_demand?product_id=...&month=...&week=..."

@app.route("/predict_demand", methods=["GET"])
def predict_demand():
    try:
        # Get query params
        product_id = request.args.get("product_id")
        month = request.args.get("month")
        week = request.args.get("week")

        # Validate input
        if not product_id or not month or not week:
            return jsonify({"error": "Missing parameters. Please provide product_id, month, and week."}), 400

        product_id = int(product_id)
        month = int(month)
        week = int(week)

        # Prepare input for model
        # Add missing features with dummy values (adjust as needed)
        df = pd.DataFrame([{
            "product_id": product_id,
            "month": month,
            "week": week,
            "last_week_sales": 0,       # Placeholder
            "last_2w_sales": 0,         # Placeholder
            "last_month_sales": 0,      # Placeholder
            "season_encoded": get_season_encoded(month)
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

if __name__ == "__main__":
    app.run(debug=True)
