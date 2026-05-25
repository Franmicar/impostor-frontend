import json

def main():
    log_path = r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3\.system_generated\logs\transcript.jsonl"
    user_requests = []
    
    with open(log_path, "r", encoding="utf-8") as f:
        for line in f:
            try:
                data = json.loads(line)
                if data.get("source") == "USER_EXPLICIT" or data.get("type") == "USER_INPUT":
                    user_requests.append(data.get("content", ""))
            except Exception as e:
                pass
                
    output_path = r"C:\Users\dj_ra\.gemini\antigravity\brain\54f66187-3ed9-41ec-9a0c-c3da6de9e3c3\last_user_requests.txt"
    with open(output_path, "w", encoding="utf-8") as out:
        out.write("\n---\n".join(user_requests[-20:]))
    print("Successfully wrote requests history.")

if __name__ == '__main__':
    main()
