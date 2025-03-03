from PIL import Image, ImageDraw

# Create a new image with a purple gradient background
width = 800
height = 400
image = Image.new('RGB', (width, height), '#6f42c1')
draw = ImageDraw.Draw(image)

# Draw a simple car silhouette in white
car_points = [
    (300, 300),  # Bottom left
    (700, 300),  # Bottom right
    (700, 250),  # Back
    (650, 200),  # Roof back
    (450, 150),  # Roof middle
    (350, 200),  # Roof front
    (250, 200),  # Hood
    (300, 300),  # Back to start
]
draw.polygon(car_points, fill='white')

# Draw wheels
draw.ellipse([280, 280, 320, 320], fill='black')  # Front wheel
draw.ellipse([580, 280, 620, 320], fill='black')  # Back wheel

# Save the image
image.save('car-hero.jpg', 'JPEG')
