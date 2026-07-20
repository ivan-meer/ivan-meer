# Скаффолдер статьи для инженерного журнала.
#
# Использование:
#   python new-article.py <id-latinicei> "Заголовок статьи"
#
# Что делает:
#   1. Добавляет запись-черновик в docs/blog/articles.json
#   2. Создаёт docs/blog/content/<id>.html с шаблоном (HTML с компонентами дизайн-системы)
#
# Дальше: пишете текст в .html, кладёте картинки в docs/blog/images/,
# ссылаетесь на них как blog/images/имя.png (префикс blog/ обязателен из-за <base>).
# Компоненты: <figure><figcaption></figcaption></figure> для иллюстраций,
# <div class="callout"><div class="callout-title">...</div><p>...</p></div> для врезок,
# <div class="stats-grid"><div class="stat-card">...</div></div> для цифр.
# Когда статья готова — меняете "status": "draft" на "published" в articles.json.
import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent / "docs" / "blog"

TEMPLATE = """<!-- Черновик: HTML-фрагмент с компонентами дизайн-системы -->
<!-- Компоненты: <figure><figcaption/>, .callout, .stats-grid, <pre><code> -->

<p>Первый абзац — о чём статья и почему это важно.</p>

<figure>
  <img src="blog/images/{id}-hero.svg" alt="Описание схемы" style="max-width:600px;">
  <figcaption>Подпись к иллюстрации.</figcaption>
</figure>

<h2>Первый раздел</h2>

<p>Текст раздела. <strong>Важный акцент</strong> и <code>встроенный код</code>.</p>

<pre><code>def example():
    # блоки кода подсвечиваются моноширинным
    print("hello")</code></pre>

<div class="callout">
  <div class="callout-title">Практика</div>
  <p>Врезка с практическим примером или граблями.</p>
</div>

<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-number">70%</div>
    <div class="stat-label">первая метрика</div>
  </div>
  <div class="stat-card">
    <div class="stat-number">3×</div>
    <div class="stat-label">вторая метрика</div>
  </div>
</div>

<h2>Выводы</h2>

<p>Главная мысль статьи.</p>"""


def main() -> None:
    if len(sys.argv) < 3:
        sys.exit(__doc__ or "usage: python new-article.py <id> \"Заголовок\"")

    article_id, title = sys.argv[1], sys.argv[2]
    import re
    if not re.match(r"^[a-z0-9]+(-[a-z0-9]+)*$", article_id):
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

    content_path = ROOT / "content" / f"{article_id}.html"
    content_path.write_text(TEMPLATE.format(id=article_id), encoding="utf-8")

    print(f"Создано:\n  {content_path}\n  запись в {articles_path}")
    print("Не забудьте: tags, desc, readingTime, heroImage (blog/images/...).")


if __name__ == "__main__":
    main()
