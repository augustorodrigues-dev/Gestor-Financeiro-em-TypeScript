-- CreateTable
CREATE TABLE "usuario" (
    "user_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "reset_token" TEXT,
    "reset_token_expires" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "categoria" (
    "category_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "categoria_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "conta" (
    "account_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "balance" DECIMAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "conta_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cartaocredito" (
    "creditcard_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "limit_amount" DECIMAL NOT NULL,
    "closing_day" INTEGER NOT NULL,
    "due_day" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "cartaocredito_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "objetivo" (
    "goal_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "target_amount" DECIMAL NOT NULL,
    "current_amount" DECIMAL NOT NULL DEFAULT 0,
    "deadline" DATETIME NOT NULL,
    "user_id" INTEGER NOT NULL,
    CONSTRAINT "objetivo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orcamento" (
    "budget_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount_limit" DECIMAL NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    CONSTRAINT "orcamento_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario" ("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "orcamento_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categoria" ("category_id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transacao" (
    "transaction_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" DECIMAL NOT NULL,
    "date" DATETIME NOT NULL,
    "due_date" DATETIME,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "is_cleared" BOOLEAN NOT NULL DEFAULT false,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence_period" TEXT,
    "account_id" INTEGER,
    "category_id" INTEGER,
    "creditcard_id" INTEGER,
    "budget_id" INTEGER,
    CONSTRAINT "transacao_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "conta" ("account_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transacao_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categoria" ("category_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transacao_creditcard_id_fkey" FOREIGN KEY ("creditcard_id") REFERENCES "cartaocredito" ("creditcard_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transacao_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "orcamento" ("budget_id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");
