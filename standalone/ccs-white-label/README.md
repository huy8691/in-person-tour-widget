# In-Person Tour Widget Demo (Standalone)

This folder contains a self-contained HTML/CSS demo for embedding the Care for Kids **in-person tour widget** (iframe). Use it as a reference or starting point when implementing the iframe inside an existing marketing site or CMS.

---

## 1. Files in this folder

| File | Purpose |
|------|---------|
| `index.html` | Sample landing page that hosts the in-person tour widget iframe. |

You can open `index.html` directly in the browser, or upload the folder to any static host (S3, CloudFront, Netlify, Vercel, Nginx, etc.).

---

## 2. How to embed the in-person tour widget iframe

Add the iframe wherever you want the calculator to appear:

```html
<iframe
  id="in-person-tour-widget"
  src="https://tools.careforkids.com.au/in-person-tour-widget?providerId=YOUR_PROVIDER_ID"
  title="Care for Kids In-Person Tour Widget"
  allowtransparency="true"
  style="width: 100%; max-width: 393px; border: 0; min-height: 640px;"
  loading="lazy"
></iframe>
```

**Parameters:**

- **`providerId`** (required): Replace `YOUR_PROVIDER_ID` with the ID assigned to your organisation. This determines the theme, colors, fonts, and branding shown in the calculator.
- **`id`** (optional): If you want to share a specific calculation result, include the hash ID from a previous calculation. Example: `?providerId=2&id=abc123`

**Styling:**

- Keep the iframe width responsive; the embedded app is optimised for mobile, so we recommend capping it at `max-width: 393px`
- Set `min-height: 640px` initially; it will be updated automatically via postMessage (see section 3)
- Use `border: 0` to remove the default iframe border

### Optional lazy-loading

If you want to delay loading until the user clicks a button:

```html
<iframe
  id="in-person-tour-widget"
  data-src="https://tools.careforkids.com.au/in-person-tour-widget?providerId=YOUR_PROVIDER_ID"
  style="display:none; width:100%; max-width:393px; border:0; min-height:640px;"
></iframe>

<button id="launch-calculator">Open calculator</button>

<script>
  document.getElementById('launch-calculator').addEventListener('click', () => {
    const iframe = document.getElementById('in-person-tour-widget');
    if (!iframe.src) {
      iframe.src = iframe.dataset.src;
      iframe.style.display = 'block';
    }
    iframe.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
</script>
```

---

## 3. Auto-resizing the iframe height using postMessage

The embedded CCS calculator automatically sends its height to the parent page using the `postMessage` API. This allows the iframe to dynamically resize based on the calculator's content.

### How it works

The calculator detects height changes using:

1. **ResizeObserver**: Monitors the calculator container for size changes
2. **MutationObserver**: Watches for DOM changes (new elements, attribute updates)
3. **RequestAnimationFrame**: Optimizes performance by batching updates
4. **Interval fallback**: Sends height updates every 1 second as a safety net
5. **Initial load**: Sends height immediately when the page loads

The calculator only sends messages when:
- It detects it's embedded in an iframe (`window.self !== window.top`)
- The measured height changes by more than 0.5px (prevents unnecessary updates)

### Message format

The calculator sends messages with the following structure:

```javascript
{
  type: 'ccs-calculator-height',
  height: 1234,           // Rounded height in pixels (Math.ceil)
  measuredHeight: 1234.56 // Precise measured height
}
```

### Implementation

Add the following code to your host page to receive and handle height updates:

```html
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const iframe = document.getElementById('ccs-calculator');
    
    // IMPORTANT: Always validate the origin for security
    const allowedOrigins = [
      'https://tools.careforkids.com.au'
    ];

    window.addEventListener('message', (event) => {
      // Security check: Only accept messages from trusted origins
      if (!allowedOrigins.includes(event.origin)) {
        return;
      }

      const { type, height } = event.data || {};
      
      // Validate message type and height value
      if (type === 'ccs-calculator-height' && typeof height === 'number' && height > 0) {
        // Apply minimum height to prevent collapse during initial load
        const minimumHeight = 640;
        const finalHeight = Math.max(height, minimumHeight);
        
        // Update iframe dimensions
        if (iframe) {
          iframe.style.height = `${height}px`;
          iframe.style.minHeight = `${finalHeight}px`;
        }
      }
    });
  });
</script>
```

### Complete example

Here's a complete example with error handling:

```html
<script>
  (function() {
    'use strict';
    
    const iframe = document.getElementById('ccs-calculator');
    if (!iframe) {
      console.error('[CCS Calculator] Iframe element not found');
      return;
    }

    const allowedOrigins = [
      'https://tools.careforkids.com.au'
    ];

    const MIN_HEIGHT = 640;

    function handleHeightMessage(event) {
      // Validate origin
      if (!allowedOrigins.includes(event.origin)) {
        return;
      }

      // Validate message structure
      if (!event.data || typeof event.data !== 'object') {
        return;
      }

      const { type, height } = event.data;

      // Validate message type and height
      if (type !== 'ccs-calculator-height' || typeof height !== 'number' || height <= 0) {
        return;
      }

      // Apply height with minimum constraint
      const finalHeight = Math.max(height, MIN_HEIGHT);
      iframe.style.height = `${height}px`;
      iframe.style.minHeight = `${finalHeight}px`;
    }

    // Listen for messages
    window.addEventListener('message', handleHeightMessage);
  })();
</script>
```

### Custom domain setup

If you're hosting the calculator on a custom domain, add your domain to `allowedOrigins`:

```javascript
const allowedOrigins = [
  'https://tools.careforkids.com.au',
  'https://calculator.yourdomain.com' // Add your custom domain if applicable
];
```

---

Need further help? Reach out to the Care for Kids team for environment credentials or styling questions.
