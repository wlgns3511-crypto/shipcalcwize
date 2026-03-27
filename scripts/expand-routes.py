#!/usr/bin/env python3
"""Expand shipcalcwize routes to all country pairs."""
import sqlite3, os, random

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'shipping.db')
conn = sqlite3.connect(DB_PATH)

# Region-based base costs (USD per kg)
REGION_AIR_COSTS = {
    'North America': 3.5, 'Europe': 5.2, 'Asia': 4.8, 'East Asia': 4.5,
    'Southeast Asia': 5.0, 'South Asia': 5.5, 'Middle East': 6.2,
    'Africa': 7.8, 'Latin America': 6.5, 'Caribbean': 7.0,
    'Oceania': 6.8, 'Central Asia': 7.2,
}
REGION_SEA_COSTS = {
    'North America': 0.8, 'Europe': 1.2, 'Asia': 1.0, 'East Asia': 0.9,
    'Southeast Asia': 1.1, 'South Asia': 1.3, 'Middle East': 1.5,
    'Africa': 2.0, 'Latin America': 1.8, 'Caribbean': 2.2,
    'Oceania': 1.6, 'Central Asia': 2.5,
}
REGION_AIR_DAYS = {
    'North America': 3, 'Europe': 5, 'Asia': 6, 'East Asia': 5,
    'Southeast Asia': 6, 'South Asia': 7, 'Middle East': 5,
    'Africa': 9, 'Latin America': 7, 'Caribbean': 6,
    'Oceania': 7, 'Central Asia': 8,
}
REGION_SEA_DAYS = {
    'North America': 14, 'Europe': 25, 'Asia': 30, 'East Asia': 28,
    'Southeast Asia': 32, 'South Asia': 35, 'Middle East': 28,
    'Africa': 45, 'Latin America': 35, 'Caribbean': 28,
    'Oceania': 40, 'Central Asia': 42,
}

countries = conn.execute("SELECT code, name, slug, region FROM countries ORDER BY name").fetchall()
# Build existing routes set
existing = set()
for row in conn.execute("SELECT origin_code, dest_code FROM routes").fetchall():
    existing.add((row[0], row[1]))
    existing.add((row[1], row[0]))

batch = []
for i, (code_a, name_a, slug_a, region_a) in enumerate(countries):
    for j, (code_b, name_b, slug_b, region_b) in enumerate(countries):
        if i >= j:
            continue
        if (code_a, code_b) in existing:
            continue
        # Estimate costs based on both regions
        def avg_cost(d, k):
            v1 = d.get(region_a, 5.0)
            v2 = d.get(region_b, 5.0)
            return round((v1 + v2) / 2 * random.uniform(0.85, 1.15), 2)

        air_cost = avg_cost(REGION_AIR_COSTS, 'air')
        sea_cost = avg_cost(REGION_SEA_COSTS, 'sea')
        air_days = int((REGION_AIR_DAYS.get(region_a, 7) + REGION_AIR_DAYS.get(region_b, 7)) / 2 * random.uniform(0.9, 1.1))
        sea_days = int((REGION_SEA_DAYS.get(region_a, 30) + REGION_SEA_DAYS.get(region_b, 30)) / 2 * random.uniform(0.9, 1.1))
        slug = f"{slug_a}-to-{slug_b}"
        batch.append((code_a, code_b, slug, air_cost, sea_cost, air_days, sea_days, None))

# Insert in chunks
chunk_size = 1000
for start in range(0, len(batch), chunk_size):
    conn.executemany(
        "INSERT OR IGNORE INTO routes (origin_code, dest_code, slug, avg_cost_kg_air, avg_cost_kg_sea, avg_days_air, avg_days_sea, customs_notes) VALUES (?,?,?,?,?,?,?,?)",
        batch[start:start+chunk_size]
    )
    conn.commit()
    print(f"  Inserted {min(start+chunk_size, len(batch))}/{len(batch)}")

count = conn.execute("SELECT COUNT(*) FROM routes").fetchone()[0]
print(f"Total routes: {count:,}")
conn.close()
