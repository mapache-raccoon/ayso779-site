# Style Guide

## CSS Variables

The following CSS variables are defined in `assets/style.css` and should be used for consistent theming across the site.

| Variable            | Description          | Example Value |
| ------------------- | -------------------- | ------------- |
| `--primary-color`   | Main brand color     | `#1f3d2b`     |
| `--secondary-color` | Background/contrast  | `#ffffff`     |
| `--accent-color`    | Highlights/accent    | `#ffcc00`     |
| `--text-color`      | Default text color   | `#000000`     |
| `--highlight-color` | Success/active state | `#4caf50`     |
| `--border-color`    | Border color         | `#cccccc`     |

### Usage Example

```css
body {
  background: var(--secondary-color);
  color: var(--text-color);
}
.header {
  background: var(--primary-color);
  border-bottom: 2px solid var(--border-color);
}
.button-accent {
  background: var(--accent-color);
  color: var(--primary-color);
}
```
