# backend/agents.py

from flask import jsonify

# Sample data for visual explanations
EXPLANATION_IMAGES = {
    "yield sign": {
        "text": "A yield sign indicates that you must slow down and yield the right-of-way.",
        "image_url": "/static/images/yield_sign.png"
    },
    "right of way": {
        "text": "Right-of-way rules determine who goes first at intersections.",
        "image_url": "/static/images/right_of_way.png"
    }
}

def get_visual_explanation(query):
    for key in EXPLANATION_IMAGES:
        if key in query.lower():
            return EXPLANATION_IMAGES[key]
    return {"text": "Sorry, I don't have an image for that.", "image_url": ""}
