#!/usr/bin/env python3
"""
_data/*.json 파일들이 keystonewiki 스키마를 따르는지 검증합니다.
AI 툴이 직접 main에 커밋하는 구조라, push 직후 이 스크립트가
GitHub Actions에서 자동 실행되어 깨진 데이터를 조기에 잡아냅니다.
"""
import json
import sys
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "_data"
REQUIRED_ENTRY_FIELDS = {"id", "title", "summary", "body", "tags", "sources", "contributors", "created", "updated"}


def validate_file(path: Path) -> list[str]:
    errors = []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        return [f"{path.name}: JSON 파싱 실패 - {e}"]

    if path.name == "_meta.json":
        return errors  # 메타 파일은 자유 형식 허용

    if "category" not in data:
        errors.append(f"{path.name}: 'category' 필드 누락")
    if "subcategories" not in data or not isinstance(data["subcategories"], dict):
        errors.append(f"{path.name}: 'subcategories' 필드 누락 또는 형식 오류")
        return errors

    seen_ids = set()
    for sub_name, items in data["subcategories"].items():
        if not isinstance(items, list):
            errors.append(f"{path.name} > {sub_name}: 배열이어야 함")
            continue
        for i, item in enumerate(items):
            missing = REQUIRED_ENTRY_FIELDS - item.keys()
            if missing:
                errors.append(f"{path.name} > {sub_name}[{i}]: 필드 누락 {missing}")
            item_id = item.get("id")
            if item_id:
                if item_id in seen_ids:
                    errors.append(f"{path.name}: 중복 id 발견 - {item_id}")
                seen_ids.add(item_id)
    return errors


def main() -> int:
    all_errors = []
    for path in sorted(DATA_DIR.glob("*.json")):
        all_errors.extend(validate_file(path))

    if all_errors:
        print("::error::_data 검증 실패\n" + "\n".join(all_errors))
        return 1

    print(f"OK - {len(list(DATA_DIR.glob('*.json')))}개 파일 검증 통과")
    return 0


if __name__ == "__main__":
    sys.exit(main())
