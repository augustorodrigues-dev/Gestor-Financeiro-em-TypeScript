-- CreateTable
CREATE TABLE "usuario" (
    "user_id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "reset_token" VARCHAR(255),
    "reset_token_expires" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "categoria" (
    "category_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "icon" VARCHAR(50),
    "color" VARCHAR(20),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "conta" (
    "account_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'BRL',
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "conta_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "cartaocredito" (
    "creditcard_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "limit_amount" DECIMAL(15,2) NOT NULL,
    "closing_day" INTEGER NOT NULL,
    "due_day" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "cartaocredito_pkey" PRIMARY KEY ("creditcard_id")
);

-- CreateTable
CREATE TABLE "objetivo" (
    "goal_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "target_amount" DECIMAL(15,2) NOT NULL,
    "current_amount" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "deadline" DATE NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "objetivo_pkey" PRIMARY KEY ("goal_id")
);

-- CreateTable
CREATE TABLE "orcamento" (
    "budget_id" SERIAL NOT NULL,
    "amount_limit" DECIMAL(15,2) NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,

    CONSTRAINT "orcamento_pkey" PRIMARY KEY ("budget_id")
);

-- CreateTable
CREATE TABLE "transacao" (
    "transaction_id" SERIAL NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "date" DATE NOT NULL,
    "due_date" DATE,
    "description" TEXT NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "is_cleared" BOOLEAN NOT NULL DEFAULT false,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrence_period" VARCHAR(20),
    "account_id" INTEGER,
    "category_id" INTEGER,
    "creditcard_id" INTEGER,
    "budget_id" INTEGER,

    CONSTRAINT "transacao_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- AddForeignKey
ALTER TABLE "categoria" ADD CONSTRAINT "categoria_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conta" ADD CONSTRAINT "conta_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cartaocredito" ADD CONSTRAINT "cartaocredito_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "objetivo" ADD CONSTRAINT "objetivo_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamento" ADD CONSTRAINT "orcamento_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamento" ADD CONSTRAINT "orcamento_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categoria"("category_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacao" ADD CONSTRAINT "transacao_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "conta"("account_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacao" ADD CONSTRAINT "transacao_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categoria"("category_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacao" ADD CONSTRAINT "transacao_creditcard_id_fkey" FOREIGN KEY ("creditcard_id") REFERENCES "cartaocredito"("creditcard_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transacao" ADD CONSTRAINT "transacao_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "orcamento"("budget_id") ON DELETE SET NULL ON UPDATE CASCADE;
