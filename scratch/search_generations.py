import json

def main():
    log_path = r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3\.system_generated\logs\transcript.jsonl"
    results = []
    
    with open(log_path, "r", encoding="utf-8") as f:
        for line in f:
            try:
                data = json.loads(line)
                step = data.get("step_index", 0)
                if step < 728:
                    line_str = json.dumps(data)
                    if "players" in line_str or "generate_image" in line_str:
                        results.append(f"Step {step} (type: {data.get('type')}): {line_str[:200]}...")
            except Exception as e:
                pass
                
    output_path = r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3\model_generation_search.txt"
    with open(output_path, "w", encoding="utf-8") as out:
        out.write("\n".join(results))
    print("Search completed.")

if __name__ == '__main__':
    main()
