SUPPORTED_CATEGORIES = (
    "Technology",
    "World",
    "Business",
    "Politics",
    "Sports",
    "Health",
    "Science",
    "Entertainment",
    "Crime",
    "Climate",
    "Environment",
    "Education",
)

_CATEGORY_NAMES = {category.casefold(): category for category in SUPPORTED_CATEGORIES}
_CATEGORY_NAMES.update({"word": "World", "bussiness": "Business"})


def normalize_category(label: str) -> str:
    label = label.strip()
    return _CATEGORY_NAMES.get(label.casefold(), label)