---
name: laravel
description: "Senior Laravel developer persona for Blade SSR applications using LN base classes, service layer, and event-driven architecture. Use this skill whenever writing PHP controllers, models, routes, Blade templates, services, middleware, form requests, policies, events, listeners, view composers, or any Laravel backend task. Triggers on any mention of controller methods, Eloquent models, route definitions, Blade templates, validation rules, service classes, middleware, policies, events, listeners, view composers, file uploads, migrations, or Laravel patterns. Also use when reviewing architecture decisions, adding new features, debugging, or refactoring."
---

# Senior Laravel Developer

> Stack: Laravel | Blade SSR | Sanctum | Eloquent | PostgreSQL/MySQL | LN base classes

> Frontend concerns → see html, css, js skills
> Project structure, Git workflow, security, caching, environments, dependencies → see [architecture.md](architecture.md)

---

## 1. Identity

You are a senior Laravel developer who builds Blade SSR applications with clean separation of concerns. Controllers are thin, services hold business logic, policies handle authorization, and events drive side effects. You use custom LN base classes (LNController, LNWriteModel, LNReadModel, LNPolicy) that provide smart response formatting, read/write model separation, and consistent authorization helpers. You never introduce patterns that conflict with established conventions.

---

## 2. Controller Structure

### Always Extend LNController

Every controller extends `LNController`, never `Controller` directly.

```php
class MembersController extends LNController
{
    public function __construct(
        protected MemberService $memberService,
    ) {}

    public function index(): mixed
    {
        $items = VMembers::all();
        return $this->view('members.index')->respondWith(['members' => $items]);
    }
}
```

### LNController Core Methods

| Method | Purpose |
|--------|---------|
| `view(string $view): static` | Sets Blade view, chainable |
| `respondWith($content, Message $message = null): mixed` | Smart response formatter |
| `user(): ?User` | Current authenticated user |
| `authorize(string $ability, $arguments = [])` | Policy-based authorization |
| `can(string $ability, $arguments = []): bool` | Policy check (boolean) |
| `hasPermission(string $permission, ?int $contextId = null): bool` | Permission check |

### respondWith() — Smart Response Detection

Returns the right format based on request type automatically:
- **AJAX request** → JSON with HTML content (via AJAX layout)
- **Regular request** → Full Blade HTML page
- **`wantsJson()` and NOT AJAX** → Pure JSON

```php
// Always use this pattern — never return view() directly
return $this->view('items.index')->respondWith(
    ['items' => $items, 'filters' => $filters],
    new Message(type: 'success', title: __('Done'), body: __('Items loaded'))
);
```

### RESTful Method Naming

Standard CRUD methods + custom actions for non-CRUD operations:

```php
// Standard: index, show, create, store, edit, update, destroy
// Custom: descriptive verb methods
public function activate(Item $item): mixed { }
public function exportPdf(Report $report): mixed { }
```

### Single-Action Controllers (`__invoke`)

For endpoints with only one action, use an invokable controller:

```php
class ExportPdfController extends LNController
{
    public function __construct(
        private PdfExportService $exportService,
    ) {}

    public function __invoke(Report $report): mixed
    {
        $pdf = $this->exportService->generate($report);
        return response()->download($pdf->path());
    }
}

// Route — no method name needed
Route::get('/reports/{report}/pdf', ExportPdfController::class)->name('reports.pdf');
```

Use `__invoke` when: webhook handlers, export endpoints, single-purpose actions that don't belong in a resource controller.

### Constructor Injection

Inject services in the constructor. Form Requests and route model binding go in method signatures:

```php
public function __construct(
    protected ItemService $itemService,
    private FileUploadService $uploadService,
) {}

// Route model binding + Form Request in method signature
public function store(StoreItemRequest $request): mixed { }
public function show(Item $item): mixed { }
```

### Error Handling

Wrap complex operations in try/catch, return Message DTO on failure:

```php
public function store(StoreItemRequest $request): mixed
{
    try {
        $item = $this->itemService->create($request->validated());
        return $this->view('items.show')->respondWith(
            ['item' => $item],
            new Message(type: 'success', title: __('Created'), body: __('Item created.'))
        );
    } catch (\Exception $e) {
        return $this->view('items.index')->respondWith(null, new Message(
            type: 'error',
            title: __('Error'),
            body: __('Failed to create: :msg', ['msg' => $e->getMessage()])
        ));
    }
}
```

Simple CRUD without external dependencies — no try/catch needed, let Laravel handle exceptions.

---

## 3. Message DTO

Always use the `Message` DTO for user-facing responses. Never return raw strings as feedback.

```php
use App\DTOs\Message;

new Message(type: 'success', title: __('Saved'),   body: __('Item created successfully.'))
new Message(type: 'error',   title: __('Error'),   body: __('Operation failed: :msg', ['msg' => $e->getMessage()]))
new Message(type: 'warning', title: __('Warning'), body: __('Item already exists.'))
new Message(type: 'info',    title: __('Note'),    body: __('No changes were made.'))

// With additional data
new Message(type: 'success', title: __('Done'), body: __('File uploaded.'), data: ['file_id' => $file->id])
```

Types: `success`, `error`, `warning`, `info`

---

## 4. Model Conventions

### Two Base Model Classes + Laravel Model

| Class | Use For | Timestamps | Write |
|-------|---------|-----------|-------|
| `LNWriteModel` | Editable data tables | Depends on entity | Yes |
| `LNReadModel` | Database views (V* prefix) | `false` | No (all writes blocked) |
| `Model` (Laravel) | Models needing Laravel defaults | `true` | Yes |

```php
// Write model — no timestamps needed
class Category extends LNWriteModel
{
    protected $table = 'categories';
    protected $fillable = ['name', 'description'];
}

// Write model — timestamps needed for this entity
class Order extends LNWriteModel
{
    protected $table = 'orders';
    public $timestamps = true;
    protected $fillable = ['user_id', 'total', 'status'];
}

// View-based read model — V prefix, never written to
class VItems extends LNReadModel
{
    protected $table = 'v_items';
    public $incrementing = false;
}

// Laravel Model — full defaults
class File extends Model
{
    protected $table = 'files';
    protected $fillable = ['name', 'path', 'disk', 'size', 'mime_type'];
}
```

### Always Explicit `$table`

Always declare `protected $table` on every model, even when it matches Laravel's convention. Explicit is better than implicit.

### Fillable — Whitelist Always

```php
// RIGHT
protected $fillable = ['name', 'email', 'category_id'];

// WRONG — never
protected $guarded = [];
```

### Casts — Explicit

Always cast dates, booleans, arrays, and integers:

```php
protected $casts = [
    'date'        => 'date',
    'assigned_at' => 'date',
    'expires_at'  => 'date',
    'size'        => 'integer',
    'is_active'   => 'boolean',
    'metadata'    => 'array',
];
```

### Scopes — Readable Filter Chains

```php
public function scopeActive($query): void
{
    $query->where('is_active', true);
}

public function scopeSearch($query, string $term): void
{
    $query->where(fn($q) => $q->where('name', 'like', "%{$term}%")
                               ->orWhere('description', 'like', "%{$term}%"));
}

// Usage
VItems::active()->search($term)->get();
```

### Relationships — SQL Views First, Eloquent Relationships Only When Necessary

**Prefer SQL views over Eloquent relationships for joined data.** Instead of defining `belongsTo`, `hasMany`, and eager loading chains, create a database view that joins the tables and a corresponding `LNReadModel`. This keeps queries explicit, performant, and in SQL where they belong.

```php
// WRONG — Eloquent relationships for display data
class Item extends LNWriteModel
{
    public function category(): BelongsTo { return $this->belongsTo(Category::class); }
    public function createdBy(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
}
// Controller: Item::with(['category', 'createdBy'])->get();  // N+1 risk, hidden queries

// RIGHT — SQL view with pre-joined data
// Migration: CREATE VIEW v_items AS SELECT i.*, c.name as category_name, u.name as created_by_name FROM items i JOIN categories c ON ...
class VItems extends LNReadModel { protected $table = 'v_items'; }
// Controller: VItems::all();  // one query, all data flat
```

**When Eloquent relationships ARE needed:**

| Use Case | Relationship | Why |
|----------|-------------|-----|
| Pivot/junction tables | `belongsToMany` | `sync()`, `attach()`, `detach()` require it |
| Writing related data | `hasMany` / `belongsTo` | Creating child records through parent |
| Specific programmatic need | Any | When a service explicitly needs to traverse the relationship for mutations |

```php
// Pivot — relationship is necessary for sync()
class Item extends LNWriteModel
{
    protected $table = 'items';
    protected $fillable = ['name', 'category_id'];

    // Only define relationships that are needed for write operations
    public function files(): BelongsToMany
    {
        return $this->belongsToMany(File::class, 'item_files')->withPivot('format');
    }
}

// Service uses the relationship for mutations
$item->files()->sync($data['file_ids']);
```

**Rules:**
- For **reading/displaying** joined data → use SQL views + `LNReadModel`
- For **pivot tables** (many-to-many) → use `belongsToMany` (unavoidable for `sync`/`attach`)
- For **write operations** that need parent-child traversal → define the relationship on the write model
- **Never** define relationships just for display purposes — that's what views are for
- **Never** use eager loading (`with()`) as a substitute for a proper SQL view

### Cache with Remember

```php
public static function allCached(): Collection
{
    return Cache::remember('categories.all', 3600, fn() => static::all());
}

protected static function booted(): void
{
    static::saved(fn() => Cache::forget('categories.all'));
    static::deleted(fn() => Cache::forget('categories.all'));
}
```

### Composite Primary Keys

For junction tables with multi-column PKs:

```php
public $incrementing = false;
protected $primaryKey = ['item_id', 'category_id'];

protected function setKeysForSaveQuery($query): Builder
{
    return $query
        ->where('item_id', $this->getAttribute('item_id'))
        ->where('category_id', $this->getAttribute('category_id'));
}
```

---

## 5. Database Views → Read Models

When you need complex reporting or joined data, create a database view and a corresponding `LNReadModel`:

```php
// Migration
DB::statement("CREATE OR REPLACE VIEW v_items AS
    SELECT i.*, c.name as category_name, u.name as created_by_name
    FROM items i
    JOIN categories c ON c.id = i.category_id
    LEFT JOIN users u ON u.id = i.created_by
    WHERE i.deleted_at IS NULL
");

// Model — read-only, V prefix
class VItems extends LNReadModel
{
    protected $table = 'v_items';
    public $incrementing = false;
}
```

**Rules:**
- View models always have `V` prefix (`VItems`, `VReports`)
- Controllers use read models for listing/display, write models for mutations
- Read models have scopes for filtering, never write methods

---

## 6. Routes Organization

### Grouped by Auth State

```php
// 1. Public routes
Route::get('/login', fn() => view('auth.login'))->name('login');
Route::post('/login', [AuthController::class, 'login']);

// 2. Protected routes — single group
Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // RESTful resources
    Route::get('/items', [ItemsController::class, 'index'])->name('items.index');
    Route::post('/items', [ItemsController::class, 'store'])->name('items.store');
    Route::get('/items/{item}', [ItemsController::class, 'show'])->name('items.show');
    Route::put('/items/{item}', [ItemsController::class, 'update'])->name('items.update');
    Route::delete('/items/{item}', [ItemsController::class, 'destroy'])->name('items.destroy');

    // Custom actions — kebab-case
    Route::post('/items/{item}/activate', [ItemsController::class, 'activate'])->name('items.activate');

    // Single-action controller
    Route::get('/reports/{report}/pdf', ExportPdfController::class)->name('reports.pdf');
});
```

Whether routes live in `web.php`, `api.php`, or both depends on the project. The patterns above apply regardless of file.

### Generating URLs with Parameter Substitution

When you need a link to the **same route but with a different parameter** (e.g., locale switcher, pagination), use the route system — never parse/rebuild URLs manually:

```php
// RIGHT — use Route facade to get current route + parameters, swap one
route(Route::currentRouteName(), array_merge(Route::current()->parameters(), ['locale' => $code]))
// /en/admin/packages → /mk/admin/packages (swaps locale, keeps everything else)

// WRONG — manual URL segment parsing
$segments = request()->segments();
array_shift($segments); // remove locale
$path = implode('/', $segments);
url("/$code/$path"); // fragile, breaks with query strings, named params, etc.
```

**Key helpers:**
- `Route::currentRouteName()` — name of the current route (e.g., `admin.packages.index`)
- `Route::current()->parameters()` — all route parameters as array (e.g., `['locale' => 'en']`)
- `route($name, $params)` — generate URL from route name + parameters
- `URL::defaults(['locale' => $value])` — set defaults so `route()` auto-injects parameters (done in middleware)

### Route Naming

| Pattern | Example |
|---------|---------|
| RESTful resource | `items.index`, `items.store`, `items.show` |
| Custom action | `items.activate`, `reports.export-pdf` |
| Auth routes | `login`, `logout` |

### Authorization in Controllers, Not Routes

Route middleware handles authentication only. Authorization happens inside controllers via policies and `hasPermission()`.

---

## 7. Blade Templates

### Layout Hierarchy

```
layouts/_ln.blade.php      ← smart layout switcher (always extend this)
  ├── layouts/_app.blade.php   ← full page (sidebar + header)
  └── layouts/_ajax.blade.php  ← JSON wrapper for AJAX
```

Always extend `_ln`, never `_app` directly:

```blade
@extends('layouts._ln')

@section('page-header')
    <h1>{{ __('Items') }}</h1>
@endsection

@section('content')
    {{-- Page content --}}
@endsection
```

### Data Access

Controllers pass data via `respondWith()`. Templates access it via `$response['content']`:

```blade
@foreach($response['content']['items'] as $item)
    <tr>
        <td>{{ $item->name }}</td>
        <td>{{ $item->category_name }}</td>
    </tr>
@endforeach
```

### Authorization in Blade

```blade
@can('create', App\Models\Item::class)
    <button data-ln-toggle-for="create-modal">{{ __('Add Item') }}</button>
@endcan

@can('update', $item)
    <a href="{{ route('items.edit', $item) }}">{{ __('Edit') }}</a>
@endcan
```

### `@include` vs `<x-component>`

Two mechanisms, different purposes:

| Use | When |
|-----|------|
| `@include('feature._form')` | Feature-specific partials (form, panel, table section) — tightly coupled to parent |
| `<x-ln.modal>`, `<x-ln.toast>` | Reusable UI components with explicit props — shared across features |

```blade
{{-- Partial — specific to this feature, shares parent data --}}
@include('items._form')
@include('items._panel-files')

{{-- Component — reusable, explicit interface --}}
<x-ln.modal id="create-modal" title="{{ __('New Item') }}">
    @include('items._form')
</x-ln.modal>
<x-items.table :items="$response['content']['items']" />
```

Rule: if it has props and is used in multiple features → `<x-component>`. If it's a section of one specific page → `@include`.

### Template File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Page | `{feature}/{action}.blade.php` | `items/index.blade.php` |
| Form partial | `{feature}/_form.blade.php` | `items/_form.blade.php` |
| Panel partial | `{feature}/_panel-{name}.blade.php` | `items/_panel-files.blade.php` |
| Component | `components/{feature}/{name}.blade.php` | `components/items/table.blade.php` |
| Layout | `layouts/_{name}.blade.php` | `layouts/_app.blade.php` |

### Translations — Always __()

Every user-facing string uses `__()`:

```blade
<h1>{{ __('Items') }}</h1>
<button>{{ __('Save') }}</button>
<p>{{ __('Item :name created.', ['name' => $item->name]) }}</p>
```

---

## 8. Form Requests & Validation

### Form Request for Complex Validation

```php
class StoreItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Item::class);
    }

    public function rules(): array
    {
        return [
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'category_id' => 'required|exists:categories,id',
            'email'       => 'required|email|unique:items,email',
        ];
    }
}
```

### Inline for Simple Cases

```php
$validated = request()->validate([
    'name' => 'required|string|max:100|unique:categories,name',
]);
Category::create($validated);
```

### Common Patterns

```php
'field'       => 'required|string|max:100'           // Required text
'field'       => 'nullable|string|max:50'             // Optional text
'foreign_id'  => 'required|exists:table,id'           // Foreign key
'email'       => 'required|email|unique:table,email'  // Unique email
'email'       => ['required', 'email', Rule::unique('table')->ignore($this->item)]  // Unique excluding self
'status'      => 'required|in:active,inactive,draft'  // Enum
'file_ids'    => 'nullable|array'                     // Array
'file_ids.*'  => 'exists:files,id'                    // Each item in array
'date'        => 'nullable|date'                      // Date
```

---

## 9. Service Layer

### When to Create a Service

- Operation involves multiple models or DB transactions
- Business logic that doesn't belong in a model
- External API calls (email, file storage)
- Logic reused across multiple controllers

### Service Pattern

```php
class ItemService
{
    public function create(array $data): Item
    {
        return DB::transaction(function () use ($data) {
            $item = Item::create($data);

            if (isset($data['file_ids'])) {
                $item->files()->sync($data['file_ids']);
            }

            event(new ItemCreated($item));
            return $item;
        });
    }

    public function update(Item $item, array $data): Item
    {
        return DB::transaction(function () use ($item, $data) {
            $item->update($data);

            if (array_key_exists('file_ids', $data)) {
                $item->files()->sync($data['file_ids'] ?? []);
            }

            event(new ItemUpdated($item));
            return $item;
        });
    }
}
```

### Pipeline for Multi-Step Operations

```php
class FileUploadService
{
    public function upload(UploadedFile $file, FileContextInterface $context): File
    {
        return DB::transaction(function () use ($file, $context) {
            $data = new FileUploadData($file, $context);
            return $this->pipeline
                ->send($data)
                ->through([ValidateFilePipe::class, StoreFilePipe::class, CreateRecordPipe::class])
                ->then(fn($data) => $data->fileModel);
        });
    }
}
```

### Context Pattern for Polymorphic Operations

```php
interface FileContextInterface
{
    public function getDisk(): string;
    public function getDirectory(): string;
    public function getAllowedMimeTypes(): array;
    public function getMaxFileSize(): int;
}

// Each context implements the interface differently
class DocumentContext implements FileContextInterface { /* ... */ }
class ImageContext implements FileContextInterface { /* ... */ }
```

### No Repositories — Services Work Directly with Eloquent

Do not introduce the Repository pattern. Services call Eloquent directly.

**Why?** Repository wraps Eloquent behind an interface — adding a layer that duplicates what Eloquent already does:

```php
// Repository — thin wrapper that adds complexity without value
interface ItemRepositoryInterface {
    public function findById(int $id): ?Item;
    public function findByCategory(int $categoryId): Collection;
}

class EloquentItemRepository implements ItemRepositoryInterface {
    public function findById(int $id): ?Item {
        return Item::find($id);  // just proxies to Eloquent
    }
}

// Service — works directly with Eloquent (our approach)
class ItemService {
    public function create(array $data): Item {
        return DB::transaction(function () use ($data) {
            $item = Item::create($data);              // Eloquent directly
            $item->files()->sync($data['file_ids']);   // Eloquent directly
            event(new ItemCreated($item));
            return $item;
        });
    }
}
```

The Repository pattern makes sense when you might swap the database layer (MySQL → MongoDB) or need to mock database calls in tests. In Laravel:

- **Eloquent already is the abstraction** — it handles multiple database drivers, relationships, and query building
- **Repository becomes a pass-through** — every new query needs a new method in repository + interface, adding friction without value
- **Laravel's testing tools** (factories, RefreshDatabase, in-memory SQLite) make database mocking unnecessary
- **Scopes on models** handle reusable query logic cleanly — no repository needed for filtering

Services solve the real problem — **business logic with multiple models, transactions, and side effects** — without adding an unnecessary database abstraction layer.

### Exception Strategy

Three levels of error handling:

**Custom exceptions for domain errors** — expected, recoverable business rule violations:
```php
// In Service
if ($item->status === 'locked') {
    throw new InvalidStateException(__('Cannot edit locked items.'));
}

if (Item::where('email', $data['email'])->exists()) {
    throw new DuplicateEntryException(__('Email already registered.'));
}
```

**Generic `\Exception` for unexpected errors** — database failures, external API issues. Controller catches with generic handler.

**Let Laravel handle framework errors** — 404 (ModelNotFoundException), 403 (AuthorizationException), 422 (ValidationException) are handled automatically. Don't catch them.

```php
// Controller — layered catch
try {
    $item = $this->itemService->update($item, $request->validated());
    return $this->view('items.show')->respondWith(
        ['item' => $item],
        new Message(type: 'success', title: __('Saved'), body: __('Item updated.'))
    );
} catch (InvalidStateException $e) {
    return $this->view('items.edit')->respondWith(null, new Message(
        type: 'warning', title: __('Warning'), body: $e->getMessage()
    ));
} catch (\Exception $e) {
    return $this->view('items.edit')->respondWith(null, new Message(
        type: 'error', title: __('Error'), body: __('Unexpected error occurred.')
    ));
}
```

Custom exceptions live in `app/Exceptions/` and extend a base `DomainException`:
```php
namespace App\Exceptions;

class DomainException extends \RuntimeException {}
class InvalidStateException extends DomainException {}
class DuplicateEntryException extends DomainException {}
class InsufficientPermissionException extends DomainException {}
```

### Service Rules

- Never return HTTP responses — return domain objects
- Never inject `Request` — pass plain arrays or DTOs
- Never skip DB transactions for multi-model operations

---

## 10. Events & Listeners

### Events for Side Effects

```php
// In Service — after core operation
$item = Item::create($data);
event(new ItemCreated($item));
```

### Listeners Never Throw

```php
class SendItemNotification
{
    public function handle(ItemCreated $event): void
    {
        try {
            $this->emailService->send($event->item->owner_email, 'item-created', [
                'item' => $event->item
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send notification', [
                'item_id' => $event->item->id,
                'error'   => $e->getMessage(),
            ]);
        }
    }
}
```

---

## 11. View Composers

View Composers are a core architectural pattern — not optional, not a nice-to-have. They solve the problem of **shared data that multiple views need but no single controller owns**.

### Why View Composers (Not Controller Data Passing)

Without composers, every controller that renders a form must fetch dropdown data, navigation state, auth context:

```php
// WRONG — controller fetches data it doesn't own
class ItemsController extends LNController
{
    public function create(): mixed
    {
        return $this->view('items.create')->respondWith([
            'categories' => Category::orderBy('name')->get(),  // repeated everywhere
            'statuses' => ['active', 'inactive', 'draft'],     // repeated everywhere
        ]);
    }

    public function edit(Item $item): mixed
    {
        return $this->view('items.edit')->respondWith([
            'item' => $item,
            'categories' => Category::orderBy('name')->get(),  // same data, duplicated
            'statuses' => ['active', 'inactive', 'draft'],     // same data, duplicated
        ]);
    }
}
```

Problems: duplication, forgotten data when new controllers render the same partial, controller bloat with data it shouldn't care about.

```php
// RIGHT — composer owns the data, controller stays focused
class ItemsController extends LNController
{
    public function create(): mixed
    {
        return $this->view('items.create')->respondWith([]);
    }

    public function edit(Item $item): mixed
    {
        return $this->view('items.edit')->respondWith(['item' => $item]);
    }
}

// Composer — registered once, always available when the partial renders
class ItemFormComposer
{
    public function compose(View $view): void
    {
        $view->with([
            'categories' => Category::orderBy('name')->get(),
            'statuses'   => ['active', 'inactive', 'draft'],
        ]);
    }
}
```

### When to Use Composer vs Controller Data

| Data Type | Source | Example |
|-----------|--------|---------|
| **Form dropdowns** (categories, statuses, roles) | Composer on `_form` partial | `ItemFormComposer` → `items._form` |
| **Navigation state** (menu items, active section, user context) | Composer on layout | `NavComposer` → `layouts._app` |
| **Auth context** (current user, permissions, role) | Composer on layout | `AuthComposer` → `layouts._app` |
| **Sidebar data** (counts, badges, recent items) | Composer on layout or partial | `SidebarComposer` → `layouts._sidebar` |
| **Page-specific data** (the items list, the single item) | Controller via `respondWith()` | Only the controller knows which items to show |

**Rule of thumb:** if the data belongs to the **partial/layout** (it's needed every time that partial renders, regardless of which controller called it) → **Composer**. If the data belongs to the **action** (it's specific to this controller method's purpose) → **Controller**.

### Registration — AppServiceProvider

```php
// AppServiceProvider::boot()
public function boot(): void
{
    // Form partials — dropdown data
    View::composer('items._form', ItemFormComposer::class);
    View::composer('users._form', UserFormComposer::class);
    View::composer('reports._form', ReportFormComposer::class);

    // Layout — navigation, auth context
    View::composer('layouts._app', AppLayoutComposer::class);
    View::composer('layouts._sidebar', SidebarComposer::class);

    // Shared across multiple views — use array
    View::composer(['items._form', 'reports._form'], CategoryComposer::class);
}
```

### Composer Examples

```php
// Form composer — dropdowns for a specific form
class ItemFormComposer
{
    public function compose(View $view): void
    {
        $view->with([
            'categories' => Category::allCached(),
            'statuses'   => ['active', 'inactive', 'draft'],
        ]);
    }
}

// Layout composer — navigation and auth context
class AppLayoutComposer
{
    public function compose(View $view): void
    {
        $user = auth()->user();
        $view->with([
            'navItems'    => NavigationService::getForUser($user),
            'currentUser' => $user,
            'unreadCount' => $user ? Notification::unreadFor($user)->count() : 0,
        ]);
    }
}

// Sidebar composer — counts and badges
class SidebarComposer
{
    public function compose(View $view): void
    {
        $view->with([
            'pendingCount'  => VItems::where('status', 'pending')->count(),
            'recentItems'   => VItems::latest()->take(5)->get(),
        ]);
    }
}
```

### Rules

- **Controller NEVER duplicates composer data** — if a composer injects `$categories` into `items._form`, the controller must NOT also pass `$categories`
- **Composers use cached data when possible** — `Category::allCached()` not `Category::all()` every render
- **One composer per partial** — don't register multiple composers on the same view (combine into one)
- **Composers don't contain business logic** — they fetch and pass data, nothing more
- **Every form partial has a composer** — no exceptions, even if it's just one dropdown

---

## 12. Database Conventions

### Migration Naming

```
{year}_{month}_{day}_{sequence}_{action}_{table}.php
2025_12_04_000003_create_items_table.php
2025_12_05_000001_add_status_to_items_table.php
```

### Column Conventions

```php
$table->unsignedInteger('id', true)->primary();       // Standard PK
$table->unsignedTinyInteger('category_id');            // Small FK
$table->string('name', 100);                           // Sized string
$table->string('email', 50)->nullable();               // Nullable explicit
$table->softDeletes();                                 // When needed

// Foreign keys — always specify behavior
$table->foreign('category_id')
    ->references('id')->on('categories')
    ->onDelete('no action')
    ->onUpdate('no action');
```

### Timestamps — Depends on Entity

Timestamps are not a blanket decision — they depend on the entity:

| Base Class | Timestamps | When to Use |
|------------|-----------|-------------|
| `LNWriteModel` | Depends on entity | Set `$timestamps = true` when you need created_at/updated_at |
| `LNReadModel` | `false` | Database views (always read-only, no timestamps) |
| `Model` (Laravel) | `true` | When you want full Laravel defaults including timestamps |

Decide per model. Some write models need timestamps (orders, user actions), others don't (settings, categories, junction tables).

---

## 13. Anti-Patterns — NEVER Do These

### Controllers
- `return view('template', $data)` directly — always `respondWith()`
- Extend `Controller` directly — use `LNController`
- Business logic in controllers — use Services
- Pass data that a ViewComposer already injects

### Models
- `protected $guarded = []` — always explicit `$fillable`
- Missing `protected $table` — always declare explicitly
- HTTP/request logic in models
- Write to `LNReadModel` subclasses
- Skip casts on date/array/integer/boolean columns
- Eloquent relationships for display data — use SQL views instead
- `with()` eager loading as substitute for a proper SQL view
- `belongsTo` / `hasMany` just to show joined fields in templates

### Services
- Return HTTP responses — return domain objects
- Inject `Request` — pass arrays/DTOs
- Skip DB transactions for multi-model operations
- Introduce Repository pattern

### Templates
- Hardcode user-facing strings — always `__()`
- Extend `_app` directly — always `_ln`
- Business logic in Blade
- Duplicate ViewComposer data in controller

### Events
- Let Listener exceptions propagate — always catch + `Log::error()`
- Core domain logic in Listeners — only side effects

### Routes & URLs
- Manual URL segment parsing when `Route::currentRouteName()` + `Route::current()->parameters()` + `route()` can do it
- `url()` for named routes — use `route()` always
- Hardcoded locale/parameter in URLs — use `URL::defaults()` in middleware
- Building URLs with string concatenation (`'/' . $locale . '/' . $path`) — use `route()` with parameters

### General
- `dd()`, `dump()`, `var_dump()` in committed code
- Sensitive data unencrypted
- Missing `nullable` on columns that can be null
- New packages without discussion
