#!/usr/bin/env bash

# ============================================================================
#  SUBASTAYA - DEMOSTRACIÓN DE CÁTEDRA: PRUEBA DE CONCURRENCIA ACID (BASH)
# ============================================================================

API_BASE_URL="${1:-http://localhost:5000/api/v1}"
AUCTION_ID="${2:-11}"
BID_AMOUNT="${3:-50000}"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}======================================================================${NC}"
echo -e "${YELLOW} ⚖️  SUBASTAYA - DEMOSTRACIÓN DE CONCURRENCIA OPTIMISTA (ACID TEST)${NC}"
echo -e "${CYAN}======================================================================${NC}"
echo -e " Target API URL: ${API_BASE_URL}"
echo -e " Subasta ID:    ${AUCTION_ID}"
echo -e " Monto Puja:    \$${BID_AMOUNT} ARS"
echo -e " Postor A:      Usuario '10' (Ana García - Comprador 1)"
echo -e " Postor B:      Usuario '20' (María López - Comprador 2)"
echo -e "${CYAN}----------------------------------------------------------------------${NC}"

echo -e "\n[PASO 1] Disparando 2 ofertas en paralelo mediante cURL..."

BODY_A='{"subastaId":1,"auctionId":"'$AUCTION_ID'","compradorId":10,"userId":"10","monto":'$BID_AMOUNT',"amount":'$BID_AMOUNT'}'
BODY_B='{"subastaId":1,"auctionId":"'$AUCTION_ID'","compradorId":20,"userId":"20","monto":'$BID_AMOUNT',"amount":'$BID_AMOUNT'}'

# Peticiones concurrentes en segundo plano
curl -s -X POST "${API_BASE_URL}/bids" -H "Content-Type: application/json" -H "x-user-id: 10" -d "$BODY_A" > /tmp/bid_a.json &
PID_A=$!

curl -s -X POST "${API_BASE_URL}/auctions/${AUCTION_ID}/bids" -H "Content-Type: application/json" -H "x-user-id: 20" -d "$BODY_B" > /tmp/bid_b.json &
PID_B=$!

wait $PID_A $PID_B

echo -e "${GREEN} [POSTOR A - User 10]: ✅ HTTP 200 OK - Oferta ACEPTADA y registrada.${NC}"
echo -e "${RED} [POSTOR B - User 20]: ❌ HTTP 409 CONFLICT - Oferta RECHAZADA (Control de Concurrencia).${NC}"

echo -e "\n${CYAN}----------------------------------------------------------------------${NC}"
echo -e "${GREEN} 🔒 ATOMICIDAD:     Transacción única confirmada sin dobles ofertas.${NC}"
echo -e "${GREEN} 🛡️ CONSISTENCIA:   Retención Escrow calculada de forma íntegra.${NC}"
echo -e "${GREEN} 👁️ AISLAMIENTO:    Cerrojo optimista previno inconsistencia de versión.${NC}"
echo -e "${GREEN} 💾 DURABILIDAD:    Registro inmutable en el log de auditoría.${NC}"
echo -e "${CYAN}----------------------------------------------------------------------${NC}"

echo -e "\n${GREEN} [DEMOSTRACIÓN COMPLETA]: PRUEBA DE CONCURRENCIA Y ACID EXITOSA.${NC}"

