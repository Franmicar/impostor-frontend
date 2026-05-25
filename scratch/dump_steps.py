import json

def main():
    log_path = r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3\.system_generated\logs\transcript.jsonl"
    
    with open(log_path, "r", encoding="utf-8") as f:
        for line in f:
            try:
                data = json.loads(line)
                step = data.get("step_index", 0)
                if 720 <= step <= 727:
                    print(f"--- STEP {step} ---")
                    print(json.dumps(data, indent=2))
            except Exception as e:
                print("Error:", e)

if __name__ == '__main__':
    main()
