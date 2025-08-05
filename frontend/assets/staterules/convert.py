from PyPDF2 import PdfReader

reader = PdfReader("NJ.pdf")  # replace with your file
full_text = ""
for page in reader.pages:
    full_text += page.extract_text() + "\n"

# Optionally, split by state headings if the book includes them
with open("NewJersey.txt", "w", encoding="utf-8") as f:
    f.write(full_text)