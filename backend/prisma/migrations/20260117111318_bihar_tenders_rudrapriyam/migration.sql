-- CreateTable
CREATE TABLE "tender_details" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "sourceUrl" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tender_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tender_details_tenderId_key" ON "tender_details"("tenderId");

-- AddForeignKey
ALTER TABLE "tender_details" ADD CONSTRAINT "tender_details_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
