#!/usr/bin/env bash
# Roda generate-flashcards em chunks de 40 com pausa entre eles.
# Cada chunk = processo novo = circuit breaker zerado.
# Useful pra rodar overnight enquanto o user dorme.

set -e
cd "$(dirname "$0")/.."

CHUNKS=15
LIMIT_PER_CHUNK=40

for i in $(seq 1 $CHUNKS); do
  echo ""
  echo "=== Chunk $i/$CHUNKS ($(date +%H:%M:%S)) ==="
  npx tsx scripts/generate-flashcards.ts --limit=$LIMIT_PER_CHUNK 2>&1 | tail -8
  if [ $i -lt $CHUNKS ]; then
    echo "  → pausa 60s pra reset rate limits"
    sleep 60
  fi
done

echo ""
echo "=== DONE ($(date +%H:%M:%S)) ==="
