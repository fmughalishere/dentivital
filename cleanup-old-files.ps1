# Removes the files replaced by the new Dentivital build.
# Run from the project root:   .\cleanup-old-files.ps1
# Nothing here is used by the new code — leaving them in place breaks `next build`.

$ErrorActionPreference = "Stop"

$paths = @(
    # Old duplicate admin account model (roles now live on User)
    "models\Admin.ts",

    # Replaced by lib/data.ts
    "lib\getHomeData.ts",
    "lib\getBlogs.ts",

    # PayPal checkout removed — Stripe only
    "lib\paypal.ts",
    "components\PaypalButton.tsx",
    "app\api\paypal",

    # Replaced by context/AuthContext.tsx
    "context\UserContext.tsx",

    # Replaced by components/layout, components/home, components/shop, components/forms
    "components\Navbar.tsx",
    "components\Footer.tsx",
    "components\ProductCard.tsx",
    "components\AddToCartButton.tsx",
    "components\TestimonialsGrid.tsx",
    "components\FaqAccordion.tsx",
    "components\ContactForm.tsx",
    "components\NewsletterForm.tsx",
    "components\BeforeAfterSlider.tsx",
    "components\admin\AdminSidebar.tsx",

    # Replaced by /login and /register
    "app\account\login",
    "app\account\register",
    "app\admin\login",
    "app\admin\register",

    # Replaced by app/admin/* (no route group needed now)
    "app\admin\(protected)",

    # Replaced by app/api/auth/* and app/api/account/*
    "app\api\user",
    "app\api\admin\login",
    "app\api\admin\logout",
    "app\api\admin\register",
    "app\api\admin\verify",

    # Webhook moved to app/api/webhooks/stripe
    "app\api\webhook",

    # Content is now read server-side via lib/data.ts
    "app\api\blogs",
    "app\api\faqs",
    "app\api\testimonials",

    # Stale build output
    ".next"
)

$removed = 0
$missing = 0

foreach ($path in $paths) {
    $full = Join-Path $PSScriptRoot $path
    if (Test-Path -LiteralPath $full) {
        Remove-Item -LiteralPath $full -Recurse -Force
        Write-Host "removed  $path" -ForegroundColor DarkGray
        $removed++
    }
    else {
        $missing++
    }
}

Write-Host ""
Write-Host "Done. $removed removed, $missing already gone." -ForegroundColor Green
Write-Host "Next:  npm install   ->   npm run seed   ->   npm run dev" -ForegroundColor Cyan
