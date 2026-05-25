import json

def main():
    log_path = r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3\.system_generated\logs\transcript.jsonl"
    model_responses = []
    
    with open(log_path, "r", encoding="utf-8") as f:
        for line in f:
            try:
                data = json.loads(line)
                step = data.get("step_index", 0)
                if step < 728 and data.get("source") == "MODEL" and data.get("type") == "PLANNER_RESPONSE":
                    model_responses.append(f"Step {step}: {data.get('content', '')}")
            except Exception as e:
                pass
                
    output_path = r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3\last_model_responses.txt"
    with open(output_path, "w", encoding="utf-8") as out:
        out.write("\n---\n".join(model_responses[-10:]))
    print("Successfully wrote model history before current session.")

if __name__ == '__main__':
    main()
