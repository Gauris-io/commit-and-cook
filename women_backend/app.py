from flask import Flask, jsonify, request
import requests


app = Flask(__name__)

# -------------------------------
# FLAVOR MAP (UI → Foodoscope)
# -------------------------------
FLAVOR_MAP = {
    "Sour": "fruit",
    "Spicy": "Herbs and Spices",
    "Tangy": "Condiment-Sauce",
    "Sweet": "Bakery",
    "Salty": "Seafood",
    "Crunchy": "Nuts and Seeds",
    "Umami": "meat",
    "Cooling": "Beverage"
}

# Base Foodoscope URL
FOODOSCOPE_API_URL = "http://cosylab.iiitd.edu.in:6969/recipe2-api/ingredients/flavor"

AUTH_HEADERS = {
    "Authorization": "Bearer cawkw9FLX1AGQ8PrEQcj_m1DbGuWtFzDBTw6Dy9nPj6XrpkI"
}

# -------------------------------
# SEARCH FLAVORS ENDPOINT
# -------------------------------
@app.route("/api/search-flavors", methods=["GET"])
def search_flavors():
    # Extract selected flavors
    selected_ui_flavors = request.args.get("selected", "").split(",")

    # Map UI selections to API categories
    target_api_categories = set()
    for flavor in selected_ui_flavors:
        if flavor in FLAVOR_MAP:
            target_api_categories.add(FLAVOR_MAP[flavor])

    all_results = []

    try:
        for category in target_api_categories:
            response = requests.get(
                f"{FOODOSCOPE_API_URL}/{category}",
                params={"page": 1, "limit": 10},
                headers=AUTH_HEADERS
            )

            if response.status_code == 200:
                data = response.json()

                # Handle possible JSON structures
                items = data.get("payload", data) if isinstance(data, dict) else data

                if isinstance(items, dict) and "data" in items:
                    items = items["data"]

                if isinstance(items, list):
                    all_results.extend(items)

        return jsonify({
            "status": "success",
            "data": all_results[:20],  # limit results
            "ui_flavors": selected_ui_flavors
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
