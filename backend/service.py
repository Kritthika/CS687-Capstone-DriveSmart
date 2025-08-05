import ollama
def call_ollama_driving_assistant(question, state=None):
    base_prompt = (
        "You are a helpful assistant specialized in driving rules, safety, and license tips.\n"
    )
    if state:
        try:
            with open(f'state_rules/{state.lower().replace(" ", "_")}.txt', 'r') as f:
                rules_context = f.read()[:4000]  # Truncate if too long
                base_prompt += f"Refer to these rules from {state}:\n{rules_context}\n"
        except:
            base_prompt += "State-specific rules not found.\n"

    base_prompt += "Answer the user's driving-related question."

    response = ollama.chat(
        model="llama3",
        messages=[
            {"role": "system", "content": base_prompt},
            {"role": "user", "content": question}
        ]
    )
    return response['message']['content']