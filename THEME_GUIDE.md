# Apartment Management App - Theme & Design System Guide

## Overview

A comprehensive theme system has been implemented across the Apartment Management application to ensure consistent styling and appearance across all pages. The theme uses CSS variables, gradients, and a unified color palette.

---

## Color Palette

All colors are defined as CSS variables in [App.css](frontend/src/App.css) and can be used throughout your application.

### Primary Colors
- **Primary Red**: `--color-primary` (#d85a5a)
- **Primary Dark**: `--color-primary-dark` (#c73030)
- **Primary Light**: `--color-primary-light` (#e67c7c)

### Secondary Colors
- **Secondary Orange**: `--color-secondary` (#eab366)
- **Secondary Dark**: `--color-secondary-dark` (#d89d4f)
- **Secondary Light**: `--color-secondary-light` (#f0c89b)

### Accent Colors
- **Accent Blue**: `--color-accent` (#667eea)
- **Accent Dark**: `--color-accent-dark` (#5568d3)
- **Accent Light**: `--color-accent-light` (#7b8eec)

### Neutral Colors
- **Text**: `--color-text` (#1f2937) - Darkest, for main text
- **Text Light**: `--color-text-light` (#6b7280) - For secondary text
- **Background Light**: `--color-bg-light` (#f9fafb)
- **Background Lighter**: `--color-bg-lighter` (#f3f4f6)
- **Border**: `--color-border` (#e5e7eb)
- **White**: `--color-white` (#ffffff)

---

## Background & Gradients

### Main Background Gradient
```css
background: var(--bg-gradient);
background-attachment: fixed;
```
This creates a subtle gradient background (light gray to slightly lighter gray) that is fixed even when scrolling.

---

## Spacing System

Consistent spacing throughout the app for padding, margins, and gaps:

- **Extra Small**: `--spacing-xs` (0.25rem)
- **Small**: `--spacing-sm` (0.5rem)
- **Medium**: `--spacing-md` (1rem)
- **Large**: `--spacing-lg` (1.5rem)
- **Extra Large**: `--spacing-xl` (2rem)
- **2X Large**: `--spacing-2xl` (3rem)

### Usage Example:
```css
.my-element {
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  gap: var(--spacing-sm);
}
```

---

## Border Radius

Consistent rounding for all elements:

- **Small**: `--radius-sm` (4px)
- **Medium**: `--radius-md` (8px)
- **Large**: `--radius-lg` (12px)
- **Extra Large**: `--radius-xl` (16px)

### Usage Example:
```css
.card {
  border-radius: var(--radius-lg);
}

button {
  border-radius: var(--radius-md);
}
```

---

## Shadow System

Layered shadows for depth:

- **Small**: `--shadow-sm` - Subtle elevation
- **Medium**: `--shadow-md` - Standard elevation
- **Large**: `--shadow-lg` - Prominent elevation
- **Extra Large**: `--shadow-xl` - Maximum elevation

### Usage Example:
```css
.floating-card {
  box-shadow: var(--shadow-lg);
}

.subtle-element {
  box-shadow: var(--shadow-sm);
}
```

---

## Transitions & Animations

Consistent motion timing:

- **Fast**: `--transition-fast` (0.15s ease-in-out)
- **Base**: `--transition-base` (0.3s ease-in-out) - Default for most interactions
- **Slow**: `--transition-slow` (0.5s ease-in-out)

### Usage Example:
```css
.interactive-element {
  transition: var(--transition-base);
}

.button {
  transition: var(--transition-base);
}
```

---

## Button Styles

The app provides several button variants using the `.btn` class:

### Button Types
```html
<!-- Primary Button (Red) -->
<button class="btn primary">Click Me</button>

<!-- Secondary Button (Orange) -->
<button class="btn secondary">Click Me</button>

<!-- Accent Button (Blue) -->
<button class="btn accent">Click Me</button>

<!-- Outline Button -->
<button class="btn outline">Click Me</button>

<!-- Danger Button (Red) -->
<button class="btn danger">Click Me</button>
```

### Button Features
- Automatic hover effects with elevation
- Disabled state styling
- Consistent padding and sizing
- Smooth transitions

---

## Page Wrapper Classes

### `.page-wrapper`
Apply to the main container of any page:
```jsx
<div className="page-wrapper">
  <div className="page-container">
    {/* Page content */}
  </div>
</div>
```

**Features:**
- Full viewport height minimum
- Consistent background gradient
- Proper padding and spacing
- Flex layout for vertical centering

### `.page-container`
Apply to content wrapper:
```jsx
<div className="page-container">
  {/* Your content */}
</div>
```

**Features:**
- Max-width: 1200px
- Centered layout
- Responsive width

### `.page-header`
Apply to page title section:
```jsx
<div className="page-header">
  <h1>Page Title</h1>
  <p>Optional subtitle</p>
</div>
```

---

## Form Elements

All form inputs are styled consistently:

```jsx
<div className="form-group">
  <label>Input Label</label>
  <input type="text" placeholder="Enter text..." />
</div>

<div className="form-group">
  <label>Select Option</label>
  <select>
    <option>Option 1</option>
  </select>
</div>

<div className="form-group">
  <label>Message</label>
  <textarea placeholder="Enter message..."></textarea>
</div>
```

**Features:**
- Consistent border color and radius
- Focus states with accent color
- Smooth transitions
- Proper spacing

---

## Cards

Use `.card` class for card containers:

```jsx
<div className="card">
  <div className="card-header">
    <h2>Card Title</h2>
  </div>
  <div className="card-body">
    {/* Card content */}
  </div>
  <div className="card-footer">
    <button className="btn accent">Action</button>
  </div>
</div>
```

**Features:**
- White background
- Shadow and border
- Hover elevation effect
- Organized header, body, footer sections

---

## Alerts & Messages

Display different types of messages:

```jsx
<div className="alert alert-success">
  Success message here
</div>

<div className="alert alert-error">
  Error message here
</div>

<div className="alert alert-warning">
  Warning message here
</div>

<div className="alert alert-info">
  Information message here
</div>
```

---

## Tables

Style tables consistently:

```jsx
<table className="table">
  <thead>
    <tr>
      <th>Column 1</th>
      <th>Column 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data 1</td>
      <td>Data 2</td>
    </tr>
  </tbody>
</table>
```

**Features:**
- Consistent header styling
- Hover effects on rows
- Proper spacing and borders
- Responsive design

---

## Grid & Layout

### Row Grid System

For flexible multi-column layouts:

```jsx
<div className="row row-2">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<div className="row row-3">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<div className="row row-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</div>
```

**Features:**
- Responsive auto-fit columns
- Consistent gap spacing
- Mobile-first responsive design

---

## Responsive Design

The theme includes built-in responsive breakpoints:

### Desktop (Default)
- Full spacing and sizing
- Multi-column layouts

### Tablet (max-width: 1024px)
- Adjusted spacing
- 2-column layouts become 1 column

### Mobile (max-width: 768px)
- Reduced spacing
- Stacked layouts
- Full-width buttons

### Small Mobile (max-width: 480px)
- Minimal spacing
- Single column layouts
- iOS-safe font sizing (16px minimum)

---

## Best Practices

### 1. Use CSS Variables Instead of Hard-Coded Colors
❌ **Avoid:**
```css
.my-element {
  background: #d85a5a;
  color: #1f2937;
}
```

✅ **Prefer:**
```css
.my-element {
  background: var(--color-primary);
  color: var(--color-text);
}
```

### 2. Use Consistent Spacing
❌ **Avoid:**
```css
padding: 15px;
margin: 20px;
```

✅ **Prefer:**
```css
padding: var(--spacing-lg);
margin: var(--spacing-xl);
```

### 3. Apply Shadows Consistently
❌ **Avoid:**
```css
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
```

✅ **Prefer:**
```css
box-shadow: var(--shadow-md);
```

### 4. Use Transitions from the Theme
❌ **Avoid:**
```css
transition: all 0.5s ease;
```

✅ **Prefer:**
```css
transition: var(--transition-base);
```

### 5. Apply Page Wrapper Classes
```jsx
function MyPage() {
  return (
    <div className="page-wrapper">
      <div className="page-container">
        <div className="page-header">
          <h1>My Page</h1>
        </div>
        {/* Content */}
      </div>
    </div>
  );
}
```

---

## Updated CSS Files

The following CSS files have been updated to use the theme system:

- ✅ [App.css](frontend/src/App.css) - Theme variables & core styles
- ✅ [AdminLogin.css](frontend/src/pages/AdminLogin.css)
- ✅ [Home.css](frontend/src/pages/Home.css)
- ✅ [AdminDashboard.css](frontend/src/pages/AdminDashboard.css)
- ✅ [UserManagement.css](frontend/src/pages/UserManagement.css)
- ✅ [Overview.css](frontend/src/pages/Overview.css)
- ✅ [Billing.css](frontend/src/pages/Billing.css)
- ✅ [UserProfile.css](frontend/src/pages/UserProfile.css)
- ✅ [Navbar.css](frontend/src/components/Navbar.css)

---

## How to Apply Theme to New Pages

When creating a new page:

1. **Wrap content with page-wrapper:**
```jsx
function MyNewPage() {
  return (
    <div className="page-wrapper">
      <div className="page-container">
        {/* Content */}
      </div>
    </div>
  );
}
```

2. **Use theme variables in CSS:**
```css
.my-custom-element {
  background: var(--color-white);
  color: var(--color-text);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  transition: var(--transition-base);
}
```

3. **Use semantic button classes:**
```jsx
<button className="btn primary">Primary Action</button>
<button className="btn secondary">Secondary Action</button>
<button className="btn outline">Outline Button</button>
```

---

## Color Usage Guidelines

### Primary Color (#d85a5a - Red)
- Main call-to-action buttons
- Important alerts
- Primary interactive elements

### Secondary Color (#eab366 - Orange)
- Secondary buttons
- Highlight/feature sections
- Optional interactive elements

### Accent Color (#667eea - Blue)
- Links
- Focus states
- Information elements
- Outline buttons

### Neutral Colors
- Text: Use `--color-text` for main content
- Light Text: Use `--color-text-light` for secondary content
- White: Use `--color-white` for card backgrounds
- Backgrounds: Use `--bg-gradient` for page backgrounds

---

## Testing Responsive Design

To test the theme on different screen sizes:

1. Desktop: Full-width browser window
2. Tablet: 768px - 1024px width
3. Mobile: 375px - 480px width
4. Test on actual devices when possible

---

## Troubleshooting

### Colors not applying?
- Check if you're using `var(--color-xxx)` syntax correctly
- Ensure CSS variables are defined in `:root` in App.css

### Spacing inconsistent?
- Use `var(--spacing-xx)` instead of hard-coded values
- Check responsive breakpoints for overrides

### Buttons not styled?
- Add `btn` class and variant class (primary, secondary, accent, outline, danger)
- Ensure App.css is imported before your page CSS

### Fonts not consistent?
- All text inherits from body font-family in App.css
- Don't override font-family unless absolutely necessary

---

## Summary

This theme system provides:
- ✅ Consistent color palette
- ✅ Standardized spacing and sizing
- ✅ Professional shadows and gradients
- ✅ Smooth animations and transitions
- ✅ Responsive design at all breakpoints
- ✅ Accessible color contrasts

By following these guidelines, all pages will maintain a cohesive, professional appearance throughout the application.
