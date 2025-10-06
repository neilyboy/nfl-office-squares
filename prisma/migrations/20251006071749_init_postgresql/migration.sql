-- CreateTable
CREATE TABLE "AdminSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "pin" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "enableOnScreenKeyboard" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentConfig" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "paypalUsername" TEXT,
    "venmoUsername" TEXT,
    "allowCash" BOOLEAN NOT NULL DEFAULT true,
    "allowPaypal" BOOLEAN NOT NULL DEFAULT true,
    "allowVenmo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PaymentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Board" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "teamHome" TEXT NOT NULL,
    "teamAway" TEXT NOT NULL,
    "costPerSquare" DOUBLE PRECISION NOT NULL,
    "payoutQ1" DOUBLE PRECISION NOT NULL,
    "payoutQ2" DOUBLE PRECISION NOT NULL,
    "payoutQ3" DOUBLE PRECISION NOT NULL,
    "payoutQ4" DOUBLE PRECISION NOT NULL,
    "payoutType" TEXT NOT NULL DEFAULT 'percentage',
    "status" TEXT NOT NULL DEFAULT 'open',
    "isFinalized" BOOLEAN NOT NULL DEFAULT false,
    "rowNumbers" TEXT,
    "colNumbers" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Square" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "col" INTEGER NOT NULL,
    "playerName" TEXT,
    "paymentMethod" TEXT,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Square_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Winner" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "quarter" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL,
    "scoreHome" INTEGER NOT NULL,
    "scoreAway" INTEGER NOT NULL,
    "payout" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Winner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentConfig_boardId_key" ON "PaymentConfig"("boardId");

-- CreateIndex
CREATE UNIQUE INDEX "Square_boardId_row_col_key" ON "Square"("boardId", "row", "col");

-- CreateIndex
CREATE UNIQUE INDEX "Winner_boardId_quarter_key" ON "Winner"("boardId", "quarter");

-- AddForeignKey
ALTER TABLE "PaymentConfig" ADD CONSTRAINT "PaymentConfig_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Square" ADD CONSTRAINT "Square_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winner" ADD CONSTRAINT "Winner_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE CASCADE ON UPDATE CASCADE;
