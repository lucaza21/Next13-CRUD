import { test, expect } from "@playwright/test";
import { connect, disconnect, createTestUser, cleanupTestData } from "./helpers/db";

const runId = Date.now();
const emailA = `pwtest_${runId}_a@test.local`;
const emailB = `pwtest_${runId}_b@test.local`;
const emailAdmin = `pwtest_${runId}_admin@test.local`;
const PASSWORD = "Password123!";
const TITLE_A = `[PW-TEST] Topic de prueba A ${runId}`;
const TITLE_A_EDITED = `[PW-TEST] Topic editado A ${runId}`;

let sharedContext;
let page;

async function register(page, email) {
    await page.goto("/register");
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').nth(0).fill(PASSWORD);
    await page.locator('input[type="password"]').nth(1).fill(PASSWORD);
    await page.getByRole("button", { name: "Registrarse" }).click();
    await page.waitForURL((url) => url.pathname === "/");
}

async function login(page, email) {
    await page.goto("/login");
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(PASSWORD);
    await page.getByRole("button", { name: "Iniciar sesión", exact: true }).click();
    await page.waitForURL((url) => url.pathname === "/");
}

async function logout(page) {
    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page.getByRole("button", { name: "Cerrar sesión" })).toHaveCount(0);
}

async function createTopic(page, title, description) {
    await page.goto("/addTopic");
    await page.locator('input[placeholder="Topic Title"]').fill(title);
    await page.locator('input[placeholder="Topic Description"]').fill(description);
    await page.getByRole("button", { name: "Create Topic" }).click();
    await page.waitForURL((url) => url.pathname === "/");
}

test.describe.serial("CRUD end-to-end", () => {
    test.beforeAll(async ({ browser }) => {
        await connect();
        sharedContext = await browser.newContext();
        page = await sharedContext.newPage();
    });

    test.afterAll(async () => {
        await cleanupTestData();
        await disconnect();
        if (sharedContext) {
            await sharedContext.close();
        }
    });

    test("un usuario puede registrarse, loguearse, crear un topic y verlo en la lista", async () => {
        await register(page, emailA);
        await expect(page.getByRole("button", { name: "Cerrar sesión" })).toBeVisible();
        await createTopic(page, TITLE_A, "Descripción de prueba");
        await expect(page.locator("h2", { hasText: TITLE_A })).toBeVisible();
    });

    test("buscar el topic creado lo encuentra, y una búsqueda sin match no lo muestra", async () => {
        await page.goto("/?q=PW-TEST&page=1");
        await expect(page.locator("h2", { hasText: TITLE_A })).toBeVisible();
        await page.goto("/?q=zzz_no_deberia_matchear_zzz&page=1");
        await expect(page.getByText("No se encontraron topics")).toBeVisible();
        await page.goto("/");
        await page.locator('input[placeholder="Buscar por título o descripción..."]').fill("PW-TEST");
        await page.locator('input[placeholder="Buscar por título o descripción..."]').press("Enter");
        await page.waitForURL((url) => url.searchParams.get("q") === "PW-TEST");
        await expect(page.locator("h2", { hasText: TITLE_A })).toBeVisible();
    });

    test("el dueño puede editar su topic", async () => {
        await page.goto("/?q=PW-TEST&page=1");
        const card = page.locator("div.my-3", { has: page.locator("h2", { hasText: TITLE_A }) });
        await expect(card).toBeVisible();
        await card.locator('a[href*="/editTopic/"]').click();
        await page.locator('input[placeholder="Topic Title"]').fill(TITLE_A_EDITED);
        await page.getByRole("button", { name: "Update Topic" }).click();
        await page.waitForURL((url) => url.pathname === "/");
        await expect(page.locator("h2", { hasText: TITLE_A_EDITED })).toBeVisible();
    });

    test("un segundo usuario NO ve los botones de editar/borrar del topic del primero", async () => {
        await page.goto("/");
        await logout(page);
        await register(page, emailB);
        await page.goto("/?q=PW-TEST&page=1");
        const card = page.locator("div.my-3", { has: page.locator("h2", { hasText: TITLE_A_EDITED }) });
        await expect(card).toBeVisible();
        await expect(card.locator('a[href*="/editTopic/"]')).toHaveCount(0);
        await expect(card.locator("button")).toHaveCount(0);
    });

    test("un admin puede borrar el topic y la cuenta de otro usuario", async () => {
        await createTestUser({ email: emailAdmin, password: PASSWORD, role: "admin" });
        await page.goto("/");
        await logout(page);
        await login(page, emailAdmin);
        await expect(page.getByRole("link", { name: "Admin", exact: true })).toBeVisible();
        await page.goto("/admin");
        const row = page.locator("div.my-3", { hasText: emailA });
        await expect(row).toBeVisible();
        await row.locator("button").click();
        await expect(page.getByText("¿Seguro que quieres eliminar este usuario?")).toBeVisible();
        await page.getByRole("button", { name: "Eliminar", exact: true }).click();
        await expect(page.getByText("Usuario eliminado correctamente")).toBeVisible();
        await expect(page.locator("div.my-3", { hasText: emailA })).toHaveCount(0);
        await page.goto("/?q=PW-TEST&page=1");
        await expect(page.locator("h2", { hasText: TITLE_A_EDITED })).toHaveCount(0);
        await expect(page.getByText("No se encontraron topics")).toBeVisible();
    });
});
