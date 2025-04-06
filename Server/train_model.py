import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import joblib

# Load the data
training_data = pd.read_csv("sales_data.csv")

# Convert sale_date to datetime
training_data['sale_date'] = pd.to_datetime(training_data['sale_date'])

# Extract month and week
training_data['month'] = training_data['sale_date'].dt.month
training_data['week'] = training_data['sale_date'].dt.isocalendar().week

# Encode season
def get_season(month):
    if month in [12, 1, 2]:
        return 'winter'
    elif month in [3, 4, 5]:
        return 'spring'
    elif month in [6, 7, 8]:
        return 'summer'
    else:
        return 'autumn'

training_data['season_encoded'] = training_data['month'].apply(lambda x: get_season(x))
season_map = {"winter": 0, "spring": 1, "summer": 2, "autumn": 3}
training_data['season_encoded'] = training_data['season_encoded'].map(season_map)

# Prepare features and target
features = training_data[['month', 'week', 'season_encoded']]
target = training_data['quantity']

# Split data
X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)

# Scale features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train the model
model = LinearRegression()
model.fit(X_train_scaled, y_train)

# Save the model and scaler
joblib.dump(model, "weekly_model.pkl")
joblib.dump(scaler, "scaler.pkl")

# Evaluate
predictions = model.predict(X_test_scaled)
mse = mean_squared_error(y_test, predictions)
print(f"Mean Squared Error: {mse}")
