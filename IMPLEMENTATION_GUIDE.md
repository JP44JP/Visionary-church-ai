# VisionaryChurch.ai Brand Implementation Guide

> **Quick Start Guide for Developers**  
> This guide shows you how to implement the VisionaryChurch.ai brand system in your code.

## Quick Setup

### 1. Import Brand Styles

Add to your main CSS file or layout:

```css
/* Import brand tokens */
@import './src/styles/brand-tokens.css';

/* Or import in your globals.css (already done) */
@tailwind base;
@tailwind components; 
@tailwind utilities;
```

### 2. Use Brand Components

```jsx
import { 
  Logo, 
  BrandButton, 
  BrandCard 
} from '@/components/brand'

// Use in your components
<Logo variant="full" size="md" theme="brand" />
<BrandButton variant="brand" size="lg">Get Started</BrandButton>
<BrandCard variant="church" hover>Your content</BrandCard>
```

### 3. Access Design Tokens

```jsx
import { brandTokens, getColor } from '@/lib/design-tokens'

// Get colors programmatically
const primaryColor = getColor('primary', 500) // #3B82F6
const accentColor = brandTokens.colors.accent[500] // #F59E0B
```

---

## Complete Component Reference

### Logo Component

```jsx
import Logo from '@/components/brand/Logo'

// Basic usage
<Logo />

// All variants
<Logo variant="full" size="md" theme="brand" />
<Logo variant="icon" size="lg" theme="dark" />
<Logo variant="text" size="sm" theme="light" />
<Logo variant="stacked" size="xl" theme="monochrome" />

// With animation
<Logo variant="full" size="lg" animated />
```

**Props:**
- `variant`: `'full' | 'icon' | 'text' | 'stacked'`
- `size`: `'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'`
- `theme`: `'brand' | 'light' | 'dark' | 'monochrome'`
- `animated`: `boolean`
- `className`: `string`

### Brand Buttons

```jsx
import BrandButton, { 
  WelcomeButton, 
  WorshipButton, 
  CommunityButton, 
  GrowthButton 
} from '@/components/brand/BrandButton'

// Primary brand button
<BrandButton variant="brand" size="lg">
  Start Free Trial
</BrandButton>

// Church context buttons
<WorshipButton size="md">Join Worship</WorshipButton>
<CommunityButton size="md">Connect</CommunityButton>
<GrowthButton size="md">Learn More</GrowthButton>

// With icons and loading
<BrandButton 
  variant="brand" 
  size="md"
  leftIcon={<PlusIcon />}
  loading={isSubmitting}
>
  Add Event
</BrandButton>
```

**Variants:**
- `brand`: Main brand button with gradient
- `primary`: Standard primary button
- `secondary`: Secondary gray button
- `outline`: Outlined button
- `outline-brand`: Outlined with brand colors
- `ghost`: Transparent button
- `worship`: Purple for worship contexts
- `community`: Teal for community contexts
- `growth`: Gold for growth contexts

### Brand Cards

```jsx
import BrandCard, { 
  ChurchFeatureCard, 
  TestimonialCard, 
  PricingCard, 
  StatCard 
} from '@/components/brand/BrandCard'

// Basic card
<BrandCard variant="brand" hover>
  <h3>Card Title</h3>
  <p>Card content</p>
</BrandCard>

// Feature card
<ChurchFeatureCard
  icon={<HeartIcon />}
  title="Prayer Requests"
  description="Manage and track prayer requests with AI-powered insights"
  action={<BrandButton size="sm">Learn More</BrandButton>}
/>

// Testimonial card
<TestimonialCard
  quote="VisionaryChurch.ai transformed how we connect with visitors"
  author="Pastor John Smith"
  role="Lead Pastor"
  church="Grace Community Church"
/>

// Pricing card
<PricingCard
  plan="Professional"
  price={49}
  period="month"
  popular={true}
  features={[
    'AI Chat Widget',
    'Visit Planning',
    'Prayer Requests',
    'Analytics Dashboard'
  ]}
  action={<BrandButton size="md" fullWidth>Choose Plan</BrandButton>}
/>

// Stat card
<StatCard
  value="2,847"
  label="Visitors Engaged"
  change={{ value: '+12%', type: 'increase' }}
  icon={<UsersIcon />}
  color="primary"
/>
```

---

## CSS Classes Reference

### Button Classes

```css
/* Base button */
.btn

/* Brand variants */
.btn-brand        /* Main brand button */
.btn-primary      /* Standard primary */
.btn-secondary    /* Gray secondary */
.btn-outline      /* Outlined */
.btn-outline-brand /* Brand outline */
.btn-ghost        /* Transparent */

/* Church context */
.btn-worship      /* Sacred purple */
.btn-community    /* Peaceful teal */
.btn-growth       /* Divine gold */

/* Sizes */
.btn-xs    /* Extra small */
.btn-sm    /* Small */
.btn-md    /* Medium (default) */
.btn-lg    /* Large */
.btn-xl    /* Extra large */
```

### Card Classes

```css
/* Base cards */
.card              /* Standard card */
.card-brand        /* Brand enhanced */
.card-elevated     /* Higher shadow */
.card-interactive  /* Hover effects */
.card-church       /* Church themed */
```

### Utility Classes

```css
/* Colors */
.text-brand        /* Brand primary color */
.text-church       /* Church secondary color */
.bg-brand-primary-500
.bg-brand-secondary-600

/* Gradients */
.gradient-brand    /* Primary brand gradient */
.gradient-church   /* Multi-color church gradient */
.gradient-worship  /* Purple gradient */
.gradient-community /* Teal gradient */
.gradient-growth   /* Gold gradient */
.gradient-text-brand /* Text gradient */

/* Effects */
.glow              /* Primary glow effect */
.glow-brand        /* Brand blue glow */
.glow-church       /* Purple glow */
.glow-warm         /* Gold glow */

/* Animations */
.animate-float     /* Floating animation */
.animate-glow      /* Pulsing glow */
.animate-fade-in-up /* Fade in with slide up */
```

---

## Tailwind Configuration

Your `tailwind.config.js` already includes brand tokens:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: {
            50: '#EFF6FF',
            500: '#3B82F6',
            600: '#2563EB',
            // ... full scale
          },
          secondary: {
            // Sacred Purple palette
          },
          accent: {
            // Divine Gold palette
          },
          supporting: {
            // Peaceful Teal palette
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      }
    }
  }
}
```

## CSS Custom Properties

Access brand tokens via CSS variables:

```css
.my-component {
  color: var(--brand-primary-500);
  background: var(--brand-secondary-50);
  font-family: var(--font-display);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-brand);
}
```

**Available Custom Properties:**

```css
/* Colors */
--brand-primary-500
--brand-secondary-600
--brand-accent-500
--brand-supporting-500

/* Typography */
--font-brand
--font-display
--font-mono
--font-serif

/* Spacing */
--space-1 through --space-64

/* Borders */
--radius-sm through --radius-3xl
--radius-button, --radius-card

/* Shadows */
--shadow-brand
--shadow-glow
--shadow-church
```

---

## Common Patterns

### Page Header

```jsx
<header className="bg-white border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      <Logo variant="full" size="sm" />
      <nav className="hidden md:flex space-x-8">
        {/* Navigation items */}
      </nav>
      <BrandButton size="sm">Sign In</BrandButton>
    </div>
  </div>
</header>
```

### Hero Section

```jsx
<section className="bg-gradient-to-br from-brand-primary-50 to-brand-secondary-50">
  <div className="max-w-7xl mx-auto px-4 py-20">
    <div className="text-center">
      <h1 className="text-5xl font-display font-bold gradient-text-brand mb-6">
        Transform Church Visitors Into Lifelong Members
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        AI-powered engagement platform that respects your mission 
        and amplifies your ministry.
      </p>
      <BrandButton size="xl">
        Start Free Trial
      </BrandButton>
    </div>
  </div>
</section>
```

### Feature Grid

```jsx
<section className="py-20">
  <div className="max-w-7xl mx-auto px-4">
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {features.map((feature) => (
        <ChurchFeatureCard
          key={feature.id}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </div>
  </div>
</section>
```

### Dashboard Layout

```jsx
<div className="min-h-screen bg-gray-50">
  <header className="bg-white shadow-sm">
    {/* Header content */}
  </header>
  
  <main className="max-w-7xl mx-auto py-6 px-4">
    <div className="grid lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        value="2,847"
        label="Visitors This Month"
        change={{ value: '+12%', type: 'increase' }}
        color="primary"
      />
      {/* More stat cards */}
    </div>
    
    <div className="grid lg:grid-cols-2 gap-8">
      <BrandCard variant="elevated">
        {/* Chart or content */}
      </BrandCard>
      <BrandCard variant="elevated">
        {/* More content */}
      </BrandCard>
    </div>
  </main>
</div>
```

---

## Form Styling

### Input Fields

```jsx
<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Church Name
    </label>
    <input 
      type="text"
      className="input w-full"
      placeholder="Enter your church name"
    />
  </div>
  
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Message
    </label>
    <textarea 
      className="input w-full h-32"
      placeholder="Tell us about your church"
    />
  </div>
  
  <BrandButton type="submit" size="lg" fullWidth>
    Submit
  </BrandButton>
</div>
```

### Form Layout

```jsx
<BrandCard variant="elevated" className="max-w-md mx-auto">
  <div className="text-center mb-6">
    <Logo variant="stacked" size="lg" />
    <h2 className="text-2xl font-display font-bold mt-4">
      Join VisionaryChurch.ai
    </h2>
  </div>
  
  <form className="space-y-4">
    {/* Form fields */}
  </form>
</BrandCard>
```

---

## Responsive Design

### Breakpoint Usage

```jsx
<div className="
  text-lg md:text-xl lg:text-2xl
  px-4 md:px-6 lg:px-8
  py-8 md:py-12 lg:py-16
">
  Responsive content
</div>
```

### Logo Responsive Sizing

```jsx
<Logo 
  variant="full" 
  size="sm" 
  className="block md:hidden" 
/>
<Logo 
  variant="full" 
  size="md" 
  className="hidden md:block" 
/>
```

---

## Animation Usage

### Page Transitions

```jsx
<div className="animate-fade-in-up">
  <h1 className="animate-slide-up">Page Title</h1>
  <p className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
    Content appears after title
  </p>
</div>
```

### Interactive Elements

```jsx
<BrandCard 
  variant="interactive"
  className="hover:glow-brand transition-all duration-300"
>
  Hover for glow effect
</BrandCard>
```

---

## Accessibility

### Color Contrast

Always ensure sufficient contrast ratios:

```jsx
// Good - sufficient contrast
<div className="bg-brand-primary-500 text-white">
  High contrast text
</div>

// Bad - insufficient contrast
<div className="bg-brand-primary-100 text-brand-primary-200">
  Low contrast text
</div>
```

### Focus States

All interactive elements have focus states:

```jsx
<BrandButton className="focus:ring-2 focus:ring-brand-primary-500">
  Accessible Button
</BrandButton>
```

### Alt Text and Labels

```jsx
<Logo variant="icon" className="w-8 h-8" />
<span className="sr-only">VisionaryChurch.ai Logo</span>

<input 
  type="email"
  className="input"
  aria-label="Email address"
  placeholder="Enter your email"
/>
```

---

## Performance Tips

### Font Loading

Fonts are optimized with `display=swap`:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

### SVG Optimization

Logo SVGs are optimized and can be inlined:

```jsx
import { getLogoSVG } from '@/components/brand/Logo'

// Get optimized SVG string
const logoSVG = getLogoSVG('brand')
```

### CSS Bundle Size

Use Tailwind's purge to remove unused styles:

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // ... rest of config
}
```

---

## Development Workflow

### 1. Start with Brand Components

Always prefer brand components over custom styling:

```jsx
// ✅ Good - uses brand component
<BrandButton variant="brand">Click me</BrandButton>

// ❌ Avoid - custom styling
<button className="bg-blue-500 text-white px-4 py-2 rounded">
  Click me
</button>
```

### 2. Use Design Tokens

Reference design tokens instead of hardcoded values:

```jsx
// ✅ Good - uses design token
<div style={{ color: brandTokens.colors.primary[500] }}>

// ❌ Avoid - hardcoded color
<div style={{ color: '#3B82F6' }}>
```

### 3. Follow Naming Conventions

Use consistent naming for brand-related classes and components:

```jsx
// Component naming
BrandButton, BrandCard, ChurchFeatureCard

// CSS class naming
.btn-brand, .card-church, .gradient-worship
```

---

## Troubleshooting

### Common Issues

**Logo not displaying:**
- Check if SVG files exist in `/public/brand/`
- Verify component import path
- Ensure proper props are passed

**Colors not working:**
- Verify Tailwind config includes brand colors
- Check if CSS custom properties are imported
- Confirm color names match design tokens

**Fonts not loading:**
- Check Google Fonts import in HTML head
- Verify font family names in CSS
- Ensure fallback fonts are specified

### Testing Brand Implementation

1. **Visual Regression**: Compare with brand guidelines
2. **Color Contrast**: Use accessibility testing tools  
3. **Responsive**: Test across different screen sizes
4. **Performance**: Check font loading and CSS size

---

## Support & Resources

### File Locations

```
src/
├── components/brand/
│   ├── Logo.tsx
│   ├── BrandButton.tsx
│   ├── BrandCard.tsx
│   ├── StyleGuide.tsx
│   └── VoiceGuide.tsx
├── lib/
│   └── design-tokens.ts
├── styles/
│   └── brand-tokens.css
└── app/
    └── globals.css

public/brand/
├── logo-full.svg
├── logo-icon.svg
└── logo-light.svg
```

### Quick Links

- **Brand Demo**: `/brand-demo`
- **Component Reference**: `src/components/brand/`
- **Design Tokens**: `src/lib/design-tokens.ts`
- **Brand Guidelines**: `BRAND_GUIDELINES.md`

### Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Brand Questions**: brand@visionarychurch.ai
- **Documentation**: This implementation guide

---

*Keep this guide handy while implementing the VisionaryChurch.ai brand system. When in doubt, refer to the brand guidelines and prioritize consistency across all touchpoints.*