# Laravel Architecture Reference

> Laravel-specific structure, naming, and framework patterns.
> For cross-cutting concerns (Git, security, caching, environments, dependencies) → architecture skill.

---

## 1. Project Structure

### Layout

```
app/
├── Console/              ← Artisan commands
├── DTOs/                 ← Data Transfer Objects (Message, FileUploadData)
├── Events/               ← Domain events (ItemCreated, ItemUpdated)
├── Exceptions/           ← Custom exceptions (DomainException, InvalidStateException)
├── Http/
│   ├── Controllers/      ← Thin controllers extending LNController
│   ├── Middleware/        ← Custom middleware
│   └── Requests/         ← Form Request validation classes
├── Listeners/            ← Event listeners (side effects only)
├── Models/               ← Eloquent models (LNWriteModel, LNReadModel, Model)
├── Policies/             ← Authorization policies
├── Providers/            ← Service providers (view composers registered here)
├── Services/             ← Business logic (injected into controllers)
│   ├── ItemService.php
│   ├── FileUploadService.php
│   └── Contexts/         ← FileContextInterface implementations
├── Traits/               ← Shared traits (HasRoles, etc.)
└── View/
    └── Composers/        ← View composers

config/                   ← App configuration
database/
├── migrations/           ← Ordered by date + sequence
└── seeders/              ← Reference data seeders (if needed)

resources/
├── views/
│   ├── layouts/          ← Base layouts
│   ├── components/       ← Blade components
│   ├── {feature}/        ← Feature views
│   │   ├── index.blade.php
│   │   ├── show.blade.php
│   │   ├── _form.blade.php        ← Partial (always has a ViewComposer)
│   │   └── _panel-{name}.blade.php ← Panel partial
│   └── auth/             ← Login, register, etc.
├── css/                  ← or scss/ — project styles
├── js/                   ← Project JS (coordinators)
└── lang/                 ← Translation files

routes/
├── web.php               ← Web routes (Blade SSR projects)
└── api.php               ← API routes (if needed)

public/                   ← Web root
storage/                  ← Logs, uploads, cache
tests/                    ← Test files
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Controller | PascalCase, plural, `Controller` suffix | `ItemsController` |
| Model (write) | PascalCase, singular | `Item` |
| Model (read) | `V` prefix, PascalCase | `VItems` |
| Service | PascalCase, singular, `Service` suffix | `ItemService` |
| Form Request | `Store`/`Update` prefix, `Request` suffix | `StoreItemRequest` |
| Policy | PascalCase, singular, `Policy` suffix | `ItemPolicy` |
| Event | PascalCase, past tense | `ItemCreated` |
| Listener | PascalCase, descriptive | `SendItemNotification` |
| Composer | PascalCase, `Composer` suffix | `ItemFormComposer` |
| DTO | PascalCase, descriptive | `Message`, `FileUploadData` |
| Exception | PascalCase, `Exception` suffix | `InvalidStateException` |
| Middleware | PascalCase, descriptive | `CheckPermission` |
| Migration | `snake_case` with date prefix | `2025_01_15_000001_create_items_table` |
| View | `kebab-case` or `snake_case` | `items/index.blade.php` |
| Route name | `dot.notation` | `items.index`, `items.store` |
| Config key | `snake_case` | `app.timezone` |

---

## 2. Feature Organization

New features follow a consistent vertical slice:

```
New feature "Reports":
1. Model:       app/Models/Report.php + app/Models/VReports.php
2. Migration:   database/migrations/..._create_reports_table.php
3. View:        database/migrations/..._create_v_reports_view.php
4. Service:     app/Services/ReportService.php
5. Controller:  app/Http/Controllers/ReportsController.php
6. Request:     app/Http/Requests/StoreReportRequest.php
7. Views:       resources/views/reports/index.blade.php, show.blade.php, _form.blade.php
8. Composer:    app/View/Composers/ReportFormComposer.php
9. Event:       app/Events/ReportCreated.php (if side effects needed)
10. Route:      routes/web.php (add to auth group)
```

### Rules

- **Feature = vertical slice** — all pieces in standard locations, named consistently
- **No feature folders** — don't create `app/Features/Reports/` with everything inside
- **Flat is better than nested** — `app/Services/ReportService.php` not `app/Services/Reports/ReportService.php`
- **Don't create structure you don't need yet** — no empty folders, no placeholder files

---

## 3. Laravel-Specific Security

> For general security principles → architecture skill §7.

### Laravel Implementation

```php
// Hash passwords with Laravel's built-in
Hash::make($password);

// Encrypt sensitive DB fields
protected $casts = [
    'api_key' => 'encrypted',
    'ssn' => 'encrypted',
];

// Blade auto-escapes with {{ }}
{{ $user->name }}          // safe — auto-escaped
{!! $trustedHtml !!}       // dangerous — only for trusted HTML

// CSRF is automatic for web routes
// API routes use Sanctum token auth instead
```

---

## 4. Laravel Caching

> For caching strategy and principles → architecture skill §8.

### Cache::remember Pattern

```php
// In Model — cached lookup
public static function allCached(): Collection
{
    return Cache::remember('categories.all', 3600, fn() => static::all());
}

// Invalidate on change
protected static function booted(): void
{
    static::saved(fn() => Cache::forget('categories.all'));
    static::deleted(fn() => Cache::forget('categories.all'));
}
```

### Cache Key Naming

```php
// Pattern: {entity}.{scope}.{identifier}
'categories.all'
'user.42.permissions'
'stats.monthly.2025-01'
```

### Rules

- **Always use `Cache::remember()`** — never manual get/set pairs
- **Always invalidate on write** — stale cache is worse than no cache
- **Cache in models or services** — never in controllers

---

## 5. Laravel Environment

> For environment management principles → architecture skill §9.

### .env Files

```
.env              ← Local config (gitignored)
.env.example      ← Template with all keys, no values
```

### Rules

- `APP_DEBUG=false` in production — always
- `APP_ENV` matches: `local`, `staging`, `production`
- Log level: `debug` in local, `error` or `warning` in production

---

## 6. Anti-Patterns — NEVER Do These

### Structure
- Feature folders (`app/Features/Reports/`) — use Laravel's standard layout
- Empty placeholder directories
- Deeply nested namespaces for simple features
- Business logic in controllers, models, or Blade templates — use Services
- Multiple responsibilities in one Service

### Framework
- Duplicating globals (ln-ashlar sets body/a/button styles — don't restate)
- `{!! !!}` for user-provided content
- Manual get/set for cache instead of `Cache::remember()`
- Caching in controllers
