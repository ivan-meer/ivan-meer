# Скаффолдер статьи для инженерного журнала.
#
# Использование:
#   python new-article.py <id-latinicei> "Заголовок статьи"
#
# Что делает:
#   1. Добавляет запись-черновик в docs/blog/articles.json
#   2. Создаёт docs/blog/content/<id>.md с шаблоном (Markdown рендерится на лету)
#
# Дальше: пишете текст в .md, кладёте картинки в docs/blog/images/,
# ссылаетесь на них как blog/images/имя.png (префикс blog/ обязателен из-за <base>).
# Когда статья готова — меняете "status": "draft" на "published" в articles.json.
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent / "docs" / "blog"

TEMPLATE = """<!-- Черновик. Markdown: **жирный**, `код`, ## заголовки, списки, таблицы. -->

Первый абзац — о чём статья и почему это важно.

![Описание схемы](blog/images/{id}-hero.png)

## Первый раздел

Текст раздела.

```python
# блоки кода подсвечиваются моноширинным
print("hello")
```

## Выводы

Главная мысль статьи.
"""


def main() -> None:
    if len(sys.argv) < 3:
        sys.exit(__doc__ or "usage: python new-article.py <id> \"Заголовок\"")

    article_id, title = sys.argv[1], sys.argv[2]
    if not article_id.replace("-", "").isalnum() or article_id != article_id.lower():
        sys.exit("id должен быть в kebab-case латиницей: naprimer-tak")

    articles_path = ROOT / "articles.json"
    articles = json.loads(articles_path.read_text(encoding="utf-8"))
    if any(a["id"] == article_id for a in articles):
        sys.exit(f"Статья с id '{article_id}' уже есть в articles.json")

    articles.append({
        "id": article_id,
        "title": title,
        "tags": [],
        "type": "full",
        "status": "draft",
        "date": date.today().strftime("%Y-%m"),
        "readingTime": 5,
        "desc": "TODO: короткое описание для карточки в списке.",
        "heroImage": "",
    })
    articles_path.write_text(
        json.dumps(articles, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )

    content_path = ROOT / "content" / f"{article_id}.md"
    content_path.write_text(TEMPLATE.format(id=article_id), encoding="utf-8")

    print(f"Создано:\n  {content_path}\n  запись в {articles_path}")
    print("Не забудьте: tags, desc, readingTime, heroImage (blog/images/...).")


if __name__ == "__main__":
    main()
