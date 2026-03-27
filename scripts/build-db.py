#!/usr/bin/env python3
"""Build the shipping.db SQLite database with countries, carriers, routes, and port data."""

import sqlite3
import os
import json

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'shipping.db')

def slugify(text: str) -> str:
    return text.lower().replace(' ', '-').replace(',', '').replace("'", '').replace('(', '').replace(')', '').replace('.', '')

def create_tables(conn: sqlite3.Connection):
    conn.executescript("""
        DROP TABLE IF EXISTS countries;
        DROP TABLE IF EXISTS carriers;
        DROP TABLE IF EXISTS routes;
        DROP TABLE IF EXISTS port_info;

        CREATE TABLE countries (
            code TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            region TEXT NOT NULL,
            avg_shipping_cost_kg_air REAL,
            avg_shipping_cost_kg_sea REAL,
            avg_transit_days_air INTEGER,
            avg_transit_days_sea INTEGER
        );

        CREATE TABLE carriers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            type TEXT NOT NULL,
            website TEXT,
            description TEXT
        );

        CREATE TABLE routes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            origin_code TEXT NOT NULL,
            dest_code TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            avg_cost_kg_air REAL,
            avg_cost_kg_sea REAL,
            avg_days_air INTEGER,
            avg_days_sea INTEGER,
            customs_notes TEXT,
            FOREIGN KEY (origin_code) REFERENCES countries(code),
            FOREIGN KEY (dest_code) REFERENCES countries(code)
        );

        CREATE TABLE port_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            country_code TEXT NOT NULL,
            port_name TEXT NOT NULL,
            port_type TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            FOREIGN KEY (country_code) REFERENCES countries(code)
        );

        CREATE INDEX idx_routes_origin ON routes(origin_code);
        CREATE INDEX idx_routes_dest ON routes(dest_code);
        CREATE INDEX idx_ports_country ON port_info(country_code);
    """)


def insert_countries(conn: sqlite3.Connection):
    countries = [
        # North America
        ("US", "United States", "North America", 8.50, 2.20, 3, 25),
        ("CA", "Canada", "North America", 9.00, 2.50, 3, 22),
        ("MX", "Mexico", "North America", 10.50, 3.00, 4, 20),
        # Europe
        ("GB", "United Kingdom", "Europe", 9.50, 2.80, 4, 28),
        ("DE", "Germany", "Europe", 9.00, 2.60, 4, 27),
        ("FR", "France", "Europe", 9.50, 2.70, 4, 28),
        ("IT", "Italy", "Europe", 10.00, 2.90, 5, 30),
        ("ES", "Spain", "Europe", 10.00, 2.80, 5, 29),
        ("NL", "Netherlands", "Europe", 8.50, 2.40, 4, 26),
        ("BE", "Belgium", "Europe", 8.80, 2.50, 4, 26),
        ("SE", "Sweden", "Europe", 10.50, 3.00, 5, 30),
        ("NO", "Norway", "Europe", 11.00, 3.20, 5, 31),
        ("DK", "Denmark", "Europe", 10.00, 2.80, 5, 29),
        ("FI", "Finland", "Europe", 10.50, 3.00, 5, 31),
        ("CH", "Switzerland", "Europe", 11.50, 3.50, 4, 28),
        ("AT", "Austria", "Europe", 9.50, 2.70, 5, 28),
        ("PL", "Poland", "Europe", 8.50, 2.50, 5, 29),
        ("CZ", "Czech Republic", "Europe", 9.00, 2.60, 5, 29),
        ("PT", "Portugal", "Europe", 10.00, 2.80, 5, 30),
        ("GR", "Greece", "Europe", 10.50, 3.00, 5, 31),
        ("IE", "Ireland", "Europe", 9.50, 2.80, 4, 28),
        ("HU", "Hungary", "Europe", 9.00, 2.70, 5, 30),
        ("RO", "Romania", "Europe", 9.50, 2.80, 6, 32),
        ("BG", "Bulgaria", "Europe", 9.50, 2.90, 6, 32),
        ("HR", "Croatia", "Europe", 10.00, 3.00, 6, 31),
        ("SK", "Slovakia", "Europe", 9.00, 2.70, 5, 30),
        ("SI", "Slovenia", "Europe", 9.50, 2.80, 5, 30),
        ("LT", "Lithuania", "Europe", 9.00, 2.70, 5, 30),
        ("LV", "Latvia", "Europe", 9.50, 2.80, 5, 31),
        ("EE", "Estonia", "Europe", 9.50, 2.80, 5, 31),
        ("LU", "Luxembourg", "Europe", 9.00, 2.50, 4, 27),
        ("MT", "Malta", "Europe", 11.00, 3.20, 5, 32),
        ("CY", "Cyprus", "Europe", 11.00, 3.10, 5, 31),
        ("IS", "Iceland", "Europe", 12.00, 3.50, 5, 33),
        ("UA", "Ukraine", "Europe", 10.00, 3.00, 6, 34),
        ("RS", "Serbia", "Europe", 10.50, 3.10, 6, 33),
        # East Asia
        ("CN", "China", "East Asia", 6.50, 1.50, 4, 30),
        ("JP", "Japan", "East Asia", 10.00, 2.80, 3, 25),
        ("KR", "South Korea", "East Asia", 9.00, 2.50, 3, 24),
        ("TW", "Taiwan", "East Asia", 8.50, 2.30, 4, 26),
        ("HK", "Hong Kong", "East Asia", 7.00, 1.80, 3, 22),
        ("MO", "Macau", "East Asia", 8.00, 2.00, 4, 24),
        ("MN", "Mongolia", "East Asia", 14.00, 4.50, 7, 40),
        # Southeast Asia
        ("SG", "Singapore", "Southeast Asia", 7.50, 1.80, 3, 22),
        ("TH", "Thailand", "Southeast Asia", 8.00, 2.00, 4, 28),
        ("VN", "Vietnam", "Southeast Asia", 7.50, 1.80, 5, 30),
        ("MY", "Malaysia", "Southeast Asia", 8.00, 2.00, 4, 27),
        ("ID", "Indonesia", "Southeast Asia", 9.00, 2.20, 5, 30),
        ("PH", "Philippines", "Southeast Asia", 9.50, 2.30, 5, 30),
        ("MM", "Myanmar", "Southeast Asia", 12.00, 3.50, 7, 35),
        ("KH", "Cambodia", "Southeast Asia", 10.00, 2.50, 6, 32),
        ("LA", "Laos", "Southeast Asia", 12.00, 3.50, 7, 35),
        ("BN", "Brunei", "Southeast Asia", 10.00, 2.50, 5, 28),
        # South Asia
        ("IN", "India", "South Asia", 8.00, 2.00, 5, 30),
        ("PK", "Pakistan", "South Asia", 9.50, 2.50, 6, 33),
        ("BD", "Bangladesh", "South Asia", 9.00, 2.20, 6, 33),
        ("LK", "Sri Lanka", "South Asia", 10.00, 2.50, 6, 32),
        ("NP", "Nepal", "South Asia", 13.00, 4.00, 7, 38),
        # Central Asia
        ("KZ", "Kazakhstan", "Central Asia", 12.00, 4.00, 7, 40),
        ("UZ", "Uzbekistan", "Central Asia", 13.00, 4.50, 8, 42),
        # Middle East
        ("AE", "United Arab Emirates", "Middle East", 8.00, 2.00, 4, 25),
        ("SA", "Saudi Arabia", "Middle East", 9.00, 2.30, 5, 28),
        ("IL", "Israel", "Middle East", 10.00, 2.80, 5, 28),
        ("TR", "Turkey", "Middle East", 9.50, 2.50, 5, 30),
        ("QA", "Qatar", "Middle East", 9.00, 2.20, 4, 26),
        ("KW", "Kuwait", "Middle East", 9.50, 2.30, 5, 27),
        ("BH", "Bahrain", "Middle East", 9.00, 2.20, 4, 26),
        ("OM", "Oman", "Middle East", 10.00, 2.50, 5, 28),
        ("JO", "Jordan", "Middle East", 10.50, 2.80, 5, 29),
        ("LB", "Lebanon", "Middle East", 11.00, 3.00, 6, 31),
        ("IQ", "Iraq", "Middle East", 13.00, 3.50, 7, 35),
        ("IR", "Iran", "Middle East", 14.00, 4.00, 8, 38),
        # Africa
        ("ZA", "South Africa", "Africa", 11.00, 3.00, 5, 30),
        ("NG", "Nigeria", "Africa", 13.00, 3.50, 6, 35),
        ("EG", "Egypt", "Africa", 10.00, 2.50, 5, 28),
        ("KE", "Kenya", "Africa", 12.00, 3.20, 6, 33),
        ("GH", "Ghana", "Africa", 13.00, 3.50, 6, 35),
        ("ET", "Ethiopia", "Africa", 14.00, 4.00, 7, 38),
        ("TZ", "Tanzania", "Africa", 13.00, 3.50, 6, 35),
        ("MA", "Morocco", "Africa", 10.50, 2.80, 5, 29),
        ("TN", "Tunisia", "Africa", 11.00, 3.00, 5, 30),
        ("SN", "Senegal", "Africa", 13.50, 3.50, 7, 36),
        ("CI", "Ivory Coast", "Africa", 14.00, 3.80, 7, 36),
        ("CM", "Cameroon", "Africa", 14.50, 4.00, 7, 37),
        ("UG", "Uganda", "Africa", 14.00, 4.00, 7, 38),
        ("AO", "Angola", "Africa", 15.00, 4.50, 8, 40),
        ("MZ", "Mozambique", "Africa", 14.00, 3.80, 7, 37),
        ("ZW", "Zimbabwe", "Africa", 15.00, 4.50, 8, 40),
        ("CD", "DR Congo", "Africa", 16.00, 5.00, 8, 42),
        ("DZ", "Algeria", "Africa", 11.00, 3.00, 6, 31),
        ("LY", "Libya", "Africa", 14.00, 4.00, 8, 38),
        ("SD", "Sudan", "Africa", 15.00, 4.50, 8, 40),
        ("RW", "Rwanda", "Africa", 14.00, 4.00, 7, 38),
        ("MU", "Mauritius", "Africa", 12.00, 3.20, 6, 32),
        ("MG", "Madagascar", "Africa", 14.00, 3.80, 7, 36),
        # Oceania
        ("AU", "Australia", "Oceania", 10.00, 2.50, 4, 28),
        ("NZ", "New Zealand", "Oceania", 11.00, 2.80, 5, 30),
        ("FJ", "Fiji", "Oceania", 14.00, 4.00, 7, 35),
        ("PG", "Papua New Guinea", "Oceania", 15.00, 4.50, 8, 38),
        # South America
        ("BR", "Brazil", "South America", 11.00, 3.00, 5, 30),
        ("AR", "Argentina", "South America", 12.00, 3.50, 5, 32),
        ("CL", "Chile", "South America", 11.50, 3.20, 5, 30),
        ("CO", "Colombia", "South America", 11.00, 3.00, 5, 28),
        ("PE", "Peru", "South America", 11.50, 3.20, 5, 30),
        ("EC", "Ecuador", "South America", 12.00, 3.30, 5, 30),
        ("VE", "Venezuela", "South America", 14.00, 4.00, 7, 35),
        ("UY", "Uruguay", "South America", 12.00, 3.50, 5, 32),
        ("PY", "Paraguay", "South America", 13.00, 4.00, 6, 35),
        ("BO", "Bolivia", "South America", 13.50, 4.00, 6, 36),
        ("GY", "Guyana", "South America", 14.00, 4.00, 6, 35),
        # Central America & Caribbean
        ("PA", "Panama", "Central America", 10.00, 2.50, 4, 22),
        ("CR", "Costa Rica", "Central America", 10.50, 2.80, 4, 24),
        ("GT", "Guatemala", "Central America", 11.00, 3.00, 5, 25),
        ("HN", "Honduras", "Central America", 11.50, 3.20, 5, 26),
        ("SV", "El Salvador", "Central America", 11.00, 3.00, 5, 25),
        ("NI", "Nicaragua", "Central America", 12.00, 3.50, 5, 28),
        ("BZ", "Belize", "Central America", 12.00, 3.50, 5, 27),
        ("JM", "Jamaica", "Caribbean", 11.00, 3.00, 4, 25),
        ("TT", "Trinidad and Tobago", "Caribbean", 11.50, 3.20, 5, 26),
        ("DO", "Dominican Republic", "Caribbean", 10.50, 2.80, 4, 24),
        ("CU", "Cuba", "Caribbean", 15.00, 4.50, 8, 35),
        ("HT", "Haiti", "Caribbean", 13.00, 3.80, 6, 30),
        ("BS", "Bahamas", "Caribbean", 10.00, 2.80, 3, 22),
        ("BB", "Barbados", "Caribbean", 11.50, 3.20, 5, 26),
        ("PR", "Puerto Rico", "Caribbean", 7.50, 2.00, 3, 18),
        # Additional European microstates
        ("MC", "Monaco", "Europe", 10.00, 3.00, 4, 28),
        ("AD", "Andorra", "Europe", 10.50, 3.00, 5, 29),
        ("LI", "Liechtenstein", "Europe", 11.00, 3.20, 4, 28),
        # Additional countries
        ("GE", "Georgia", "Europe", 11.00, 3.20, 6, 33),
        ("AM", "Armenia", "Central Asia", 12.00, 3.50, 7, 35),
        ("AZ", "Azerbaijan", "Central Asia", 12.00, 3.50, 7, 36),
        ("TM", "Turkmenistan", "Central Asia", 14.00, 4.50, 8, 42),
        ("KG", "Kyrgyzstan", "Central Asia", 13.00, 4.00, 8, 40),
        ("TJ", "Tajikistan", "Central Asia", 14.00, 4.50, 8, 42),
        ("AF", "Afghanistan", "South Asia", 16.00, 5.00, 9, 45),
        ("BT", "Bhutan", "South Asia", 15.00, 4.50, 8, 40),
        ("MV", "Maldives", "South Asia", 13.00, 3.50, 6, 33),
        ("YE", "Yemen", "Middle East", 15.00, 4.50, 8, 40),
        ("SY", "Syria", "Middle East", 16.00, 5.00, 9, 42),
        ("PS", "Palestine", "Middle East", 14.00, 4.00, 7, 35),
        # Additional African
        ("BF", "Burkina Faso", "Africa", 15.00, 4.50, 8, 38),
        ("ML", "Mali", "Africa", 15.00, 4.50, 8, 39),
        ("NE", "Niger", "Africa", 16.00, 5.00, 9, 42),
        ("TD", "Chad", "Africa", 16.00, 5.00, 9, 43),
        ("MW", "Malawi", "Africa", 14.50, 4.00, 7, 38),
        ("ZM", "Zambia", "Africa", 13.50, 3.80, 7, 37),
        ("BW", "Botswana", "Africa", 13.00, 3.50, 6, 34),
        ("NA", "Namibia", "Africa", 13.00, 3.50, 6, 34),
        ("GA", "Gabon", "Africa", 14.50, 4.00, 7, 37),
        ("CG", "Republic of Congo", "Africa", 15.00, 4.50, 8, 40),
        ("ER", "Eritrea", "Africa", 16.00, 5.00, 9, 42),
        ("DJ", "Djibouti", "Africa", 13.00, 3.50, 6, 34),
        ("SO", "Somalia", "Africa", 17.00, 5.50, 10, 45),
        ("GM", "Gambia", "Africa", 14.00, 4.00, 7, 37),
        ("GN", "Guinea", "Africa", 15.00, 4.50, 8, 39),
        ("SL", "Sierra Leone", "Africa", 15.00, 4.50, 8, 39),
        ("LR", "Liberia", "Africa", 15.00, 4.50, 8, 39),
        ("TG", "Togo", "Africa", 14.50, 4.00, 7, 37),
        ("BJ", "Benin", "Africa", 14.50, 4.00, 7, 37),
        ("CV", "Cape Verde", "Africa", 13.00, 3.50, 6, 34),
        ("SC", "Seychelles", "Africa", 13.00, 3.50, 6, 33),
        ("LS", "Lesotho", "Africa", 14.00, 4.00, 7, 36),
        ("SZ", "Eswatini", "Africa", 14.00, 4.00, 7, 36),
        ("BI", "Burundi", "Africa", 16.00, 5.00, 9, 42),
        ("CF", "Central African Republic", "Africa", 17.00, 5.50, 10, 45),
        ("SS", "South Sudan", "Africa", 17.00, 5.50, 10, 45),
        # Additional Oceania
        ("WS", "Samoa", "Oceania", 15.00, 4.50, 8, 38),
        ("TO", "Tonga", "Oceania", 15.00, 4.50, 8, 38),
        ("VU", "Vanuatu", "Oceania", 15.00, 4.50, 8, 38),
        # Additional
        ("AL", "Albania", "Europe", 10.50, 3.00, 6, 32),
        ("BA", "Bosnia and Herzegovina", "Europe", 10.50, 3.00, 6, 32),
        ("ME", "Montenegro", "Europe", 10.50, 3.00, 6, 32),
        ("MK", "North Macedonia", "Europe", 10.50, 3.00, 6, 32),
        ("XK", "Kosovo", "Europe", 11.00, 3.20, 6, 33),
        ("MD", "Moldova", "Europe", 10.50, 3.00, 6, 33),
        ("BY", "Belarus", "Europe", 11.00, 3.50, 6, 34),
        ("RU", "Russia", "Europe", 11.00, 3.20, 6, 35),
    ]

    for c in countries:
        code, name, region, air_cost, sea_cost, air_days, sea_days = c
        slug = slugify(name)
        conn.execute(
            "INSERT INTO countries VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (code, name, slug, region, air_cost, sea_cost, air_days, sea_days)
        )


def insert_carriers(conn: sqlite3.Connection):
    carriers = [
        ("FedEx International", "fedex", "express", "https://www.fedex.com", "Global express delivery with tracking. Priority and Economy options available."),
        ("UPS Worldwide", "ups", "express", "https://www.ups.com", "International express and standard shipping with package tracking."),
        ("DHL Express", "dhl-express", "express", "https://www.dhl.com", "Worldwide express delivery specialist. Leading international courier."),
        ("DHL Global Forwarding", "dhl-freight", "sea", "https://www.dhl.com/global-forwarding", "Full container and less-than-container sea freight services."),
        ("Maersk", "maersk", "sea", "https://www.maersk.com", "World's largest container shipping line. FCL and LCL services."),
        ("MSC", "msc", "sea", "https://www.msc.com", "Mediterranean Shipping Company. Major global container line."),
        ("CMA CGM", "cma-cgm", "sea", "https://www.cma-cgm.com", "French container shipping and logistics company."),
        ("Hapag-Lloyd", "hapag-lloyd", "sea", "https://www.hapag-lloyd.com", "German container shipping company with global reach."),
        ("COSCO Shipping", "cosco", "sea", "https://www.coscoshipping.com", "Chinese state-owned shipping line. Extensive Asia routes."),
        ("Evergreen Marine", "evergreen", "sea", "https://www.evergreen-marine.com", "Taiwanese container shipping company. Pacific specialist."),
        ("ONE (Ocean Network Express)", "one", "sea", "https://www.one-line.com", "Japanese carrier alliance. Japan-originated global routes."),
        ("USPS International", "usps", "air", "https://www.usps.com", "US Postal Service international mail and parcel services."),
        ("Royal Mail International", "royal-mail", "air", "https://www.royalmail.com", "UK postal service international delivery."),
        ("China Post", "china-post", "air", "https://www.chinapost.com.cn", "Chinese national postal service for international parcels."),
        ("EMS (Express Mail Service)", "ems", "air", "https://www.ems.post", "International express mail service via postal networks."),
        ("SF Express", "sf-express", "express", "https://www.sf-express.com", "Leading Chinese express delivery company. Strong Asia coverage."),
        ("Aramex", "aramex", "express", "https://www.aramex.com", "Middle East-based logistics and express delivery company."),
        ("TNT (FedEx)", "tnt", "express", "https://www.tnt.com", "European express delivery network, now part of FedEx."),
        ("DB Schenker", "db-schenker", "sea", "https://www.dbschenker.com", "German logistics company. Air and sea freight forwarding."),
        ("Kuehne+Nagel", "kuehne-nagel", "sea", "https://www.kuehne-nagel.com", "Swiss logistics company. Leading sea freight forwarder."),
        ("Nippon Express", "nippon-express", "air", "https://www.nipponexpress.com", "Japanese logistics company with global freight services."),
        ("YangMing Marine", "yangming", "sea", "https://www.yangming.com", "Taiwanese container shipping with trans-Pacific focus."),
        ("ZIM", "zim", "sea", "https://www.zim.com", "Israeli container shipping. Niche trade lanes specialist."),
        ("Flexport", "flexport", "sea", "https://www.flexport.com", "Modern digital freight forwarder for air and ocean."),
    ]

    for c in carriers:
        name, slug, ctype, website, desc = c
        conn.execute(
            "INSERT INTO carriers (name, slug, type, website, description) VALUES (?, ?, ?, ?, ?)",
            (name, slug, ctype, website, desc)
        )


def insert_routes(conn: sqlite3.Connection):
    import math
    import hashlib

    # Hand-curated routes with specific customs notes (used as overrides)
    curated = {
        ("US", "GB"): (12.50, 3.50, 5, 28, "UK customs duty applies on goods over GBP135. VAT at 20% on most items."),
        ("US", "DE"): (13.00, 3.80, 5, 30, "German customs duty for non-EU goods. VAT at 19%. EORI number needed for commercial shipments."),
        ("US", "FR"): (13.50, 3.80, 5, 30, "French customs apply EU common external tariff. TVA at 20%."),
        ("US", "JP"): (14.00, 4.00, 4, 25, "Japan consumption tax 10%. Customs duty varies by product category."),
        ("US", "CN"): (12.00, 3.00, 5, 32, "Chinese customs duties vary widely. Cross-border e-commerce has special rates."),
        ("US", "KR"): (13.00, 3.50, 4, 24, "Korea customs duty + VAT 10%. FTA benefits for qualifying US goods."),
        ("US", "AU"): (14.00, 3.80, 5, 28, "Australian GST 10% on imports over AUD1000. No general customs duty for most US goods under AUSFTA."),
        ("US", "CA"): (8.00, 2.50, 2, 12, "USMCA/CUSMA duty-free for qualifying goods. GST/HST applies. De minimis CAD150."),
        ("US", "MX"): (9.50, 2.80, 3, 15, "USMCA benefits. Mexican VAT 16%. Customs duties vary by tariff classification."),
        ("US", "IN"): (13.00, 3.20, 6, 32, "Indian customs duties vary from 0-150%. GST applies. Complex import regulations."),
        ("US", "BR"): (15.00, 4.00, 6, 32, "Brazilian import taxes total 60%+ on many goods. ICMS, IPI, PIS, COFINS apply."),
        ("US", "SG"): (11.00, 2.80, 4, 24, "Singapore has no customs duty on most goods. GST 9%."),
        ("US", "AE"): (12.00, 3.00, 5, 26, "UAE VAT 5%. No customs duty in free zones. Standard rate 5% on most goods."),
        ("US", "NL"): (12.50, 3.50, 4, 27, "Netherlands follows EU customs. VAT 21%. Rotterdam is major port of entry."),
        ("US", "IT"): (13.50, 3.80, 5, 30, "Italian customs follow EU tariff. IVA at 22%."),
        ("US", "ES"): (13.50, 3.80, 5, 30, "Spanish customs follow EU tariff. IVA at 21%."),
        ("US", "TH"): (12.50, 3.00, 5, 30, "Thai customs duties vary. VAT 7%. Some goods require import permits."),
        ("US", "VN"): (12.00, 2.80, 6, 32, "Vietnam import duties vary widely. VAT 10%. Special consumption tax on luxury goods."),
        ("US", "SE"): (13.50, 3.80, 5, 30, "Swedish customs follow EU tariff. Moms at 25%."),
        ("US", "PL"): (13.00, 3.50, 5, 30, "Polish customs follow EU tariff. VAT 23%."),
        ("US", "SA"): (13.00, 3.20, 5, 28, "Saudi customs duty 5-20%. VAT 15%."),
        ("US", "ZA"): (15.00, 4.00, 6, 32, "South African customs duties vary. VAT 15%. AGOA benefits for some goods."),
        ("US", "ID"): (13.50, 3.20, 6, 32, "Indonesian customs duties vary widely. VAT 11%."),
        ("US", "TR"): (13.50, 3.50, 5, 30, "Turkish customs duties vary. KDV at 20%."),
        ("US", "BE"): (12.50, 3.40, 4, 27, "Belgian customs follow EU tariff. BTW at 21%."),
        ("US", "IE"): (12.50, 3.50, 5, 28, "Irish customs follow EU tariff. VAT at 23%."),
        ("US", "NZ"): (15.00, 4.00, 6, 30, "NZ GST 15%. Most goods subject to customs duty."),
        ("US", "NO"): (14.00, 3.80, 5, 30, "Norwegian customs + MVA 25%. Not EU member."),
        ("US", "DK"): (13.50, 3.70, 5, 29, "Danish customs follow EU tariff. Moms at 25%."),
        ("CN", "US"): (7.00, 1.80, 5, 30, "US customs duties apply. De minimis $800. Section 301 tariffs on Chinese goods."),
        ("CN", "GB"): (8.00, 2.00, 7, 32, "UK customs duty + VAT 20%. Low value consignment relief for items under GBP135."),
        ("CN", "DE"): (8.50, 2.20, 7, 33, "EU anti-dumping duties may apply. Standard customs + 19% MwSt."),
        ("CN", "JP"): (7.50, 1.50, 3, 18, "Japan customs duty varies. Consumption tax 10%. Many items have preferential rates."),
        ("CN", "KR"): (6.50, 1.20, 2, 12, "Korea-China FTA benefits. Customs duty + VAT 10%."),
        ("CN", "AU"): (9.00, 2.00, 5, 25, "ChAFTA reduces duties on many Chinese goods. GST 10% on imports over AUD1000."),
        ("CN", "SG"): (5.50, 1.20, 3, 18, "Most goods duty-free into Singapore. GST 9%."),
        ("CN", "CA"): (9.00, 2.20, 6, 30, "Canadian customs duties vary. GST/HST applies. De minimis CAD20 for postal."),
        ("CN", "TH"): (5.50, 1.20, 4, 20, "ACFTA duty-free for many goods. VAT 7%."),
        ("CN", "IN"): (8.00, 2.00, 5, 28, "Indian customs duties on Chinese goods can be very high. BIS standards apply."),
        ("CN", "BR"): (12.00, 3.00, 8, 38, "Brazilian import taxes very high on Chinese goods. 60%+ total tax burden."),
        ("CN", "AE"): (7.00, 1.50, 5, 25, "UAE customs 5% standard rate. Free zone benefits available."),
        ("CN", "FR"): (8.50, 2.20, 7, 33, "French customs apply EU common external tariff. TVA at 20%."),
        ("CN", "NL"): (8.00, 2.00, 6, 30, "Netherlands follows EU customs. VAT 21%. Rotterdam major entry point."),
        ("CN", "IT"): (9.00, 2.30, 7, 33, "Italian customs follow EU tariff. IVA at 22%."),
        ("CN", "ES"): (9.00, 2.30, 7, 34, "Spanish customs follow EU tariff. IVA at 21%."),
        ("CN", "VN"): (5.00, 1.00, 3, 14, "ACFTA and RCEP benefits. Very close proximity."),
        ("CN", "ID"): (6.50, 1.50, 4, 22, "ACFTA benefits. Indonesian customs duties vary. VAT 11%."),
        ("CN", "MX"): (10.00, 2.50, 6, 32, "Mexican customs duties apply. VAT 16%."),
        ("CN", "SE"): (9.00, 2.40, 7, 34, "Swedish customs follow EU tariff. Moms at 25%."),
        ("CN", "PL"): (8.50, 2.20, 6, 32, "Polish customs follow EU tariff. VAT 23%."),
        ("CN", "SA"): (7.50, 1.80, 5, 26, "Saudi customs 5-20%. VAT 15%."),
        ("CN", "ZA"): (10.00, 2.50, 7, 32, "South African customs duties vary. VAT 15%."),
        ("CN", "TR"): (8.50, 2.00, 5, 28, "Turkish customs duties vary. KDV at 20%."),
        ("CN", "NZ"): (10.00, 2.30, 6, 28, "NZ GST 15%. RCEP benefits."),
        ("CN", "DK"): (8.80, 2.30, 7, 33, "Danish customs follow EU tariff. Moms at 25%."),
        ("CN", "BE"): (8.20, 2.10, 6, 31, "Belgian customs follow EU tariff. BTW at 21%."),
        ("CN", "IE"): (8.50, 2.20, 7, 33, "Irish customs follow EU tariff. VAT at 23%."),
        ("CN", "NO"): (9.50, 2.50, 7, 34, "Norwegian customs + MVA 25%. Not EU member."),
        ("KR", "US"): (12.00, 3.00, 4, 24, "KORUS FTA eliminates most duties. US customs still apply on some goods."),
        ("KR", "JP"): (8.00, 1.80, 2, 12, "Short transit times. Japan customs duties vary by product."),
        ("KR", "CN"): (7.00, 1.50, 2, 12, "Korea-China FTA benefits. Short sea transit."),
        ("KR", "VN"): (7.50, 1.80, 3, 18, "KVFTA preferential rates. Growing trade corridor."),
        ("KR", "DE"): (13.00, 3.50, 5, 32, "EU-Korea FTA eliminates most duties. VAT 19% applies."),
        ("KR", "AU"): (12.00, 3.00, 5, 24, "KAFTA provides preferential rates. GST 10%."),
        ("KR", "GB"): (13.00, 3.50, 5, 33, "UK-Korea FTA benefits. VAT 20%."),
        ("KR", "IN"): (10.00, 2.50, 5, 26, "India-Korea CEPA benefits. Growing trade corridor."),
        ("KR", "SG"): (8.50, 2.00, 3, 18, "Korea-Singapore FTA benefits. Singapore mostly duty-free."),
        ("KR", "TH"): (8.00, 1.80, 3, 18, "AKFTA benefits. VAT 7%."),
        ("KR", "ID"): (9.00, 2.20, 4, 22, "Korea-Indonesia FTA benefits. VAT 11%."),
        ("JP", "US"): (13.00, 3.50, 4, 24, "US-Japan Trade Agreement benefits. Well-established shipping lanes."),
        ("JP", "CN"): (8.00, 1.50, 3, 14, "Short transit. RCEP benefits for qualifying goods."),
        ("JP", "KR"): (8.00, 1.80, 2, 10, "Very short sea route. RCEP framework."),
        ("JP", "AU"): (12.00, 3.00, 5, 22, "JAEPA eliminates most duties. GST 10%."),
        ("JP", "GB"): (13.50, 3.80, 5, 35, "UK-Japan CEPA provides preferential rates."),
        ("JP", "SG"): (9.00, 2.00, 4, 18, "JSEPA benefits. Singapore mostly duty-free."),
        ("JP", "DE"): (13.50, 3.80, 5, 33, "EU-Japan EPA reduces many duties. VAT 19%."),
        ("JP", "IN"): (11.00, 2.80, 5, 28, "India-Japan CEPA benefits. Growing trade lane."),
        ("JP", "TH"): (9.00, 2.00, 4, 20, "JTEPA benefits. VAT 7%."),
        ("JP", "VN"): (9.00, 2.00, 4, 20, "RCEP and AJCEP benefits. Growing trade lane."),
        ("DE", "US"): (12.50, 3.50, 5, 28, "US customs duties apply. Strong shipping infrastructure."),
        ("DE", "CN"): (10.00, 2.50, 6, 32, "Chinese customs duties apply. Growing rail freight option."),
        ("DE", "GB"): (8.00, 2.00, 3, 14, "Post-Brexit customs declarations required. Short transit."),
        ("DE", "JP"): (13.00, 3.80, 5, 32, "EU-Japan EPA reduces many duties."),
        ("DE", "AU"): (14.00, 4.00, 6, 35, "GST 10%. Long shipping distance."),
        ("DE", "KR"): (13.00, 3.50, 5, 30, "EU-Korea FTA benefits."),
        ("DE", "FR"): (6.50, 1.80, 2, 10, "EU single market. No customs. Short transit."),
        ("DE", "NL"): (6.00, 1.50, 2, 8, "EU single market. No customs. Very short transit."),
        ("DE", "IT"): (7.00, 2.00, 2, 12, "EU single market. No customs."),
        ("DE", "ES"): (7.50, 2.20, 3, 14, "EU single market. No customs."),
        ("DE", "IN"): (12.00, 3.00, 6, 30, "Indian customs duties vary significantly."),
        ("DE", "BR"): (14.50, 4.00, 7, 35, "Brazilian import taxes very high."),
        ("DE", "TR"): (9.50, 2.50, 4, 22, "Turkey customs union with EU for industrial goods."),
        ("DE", "PL"): (6.00, 1.50, 2, 8, "EU single market. No customs. Very short transit."),
        ("DE", "SE"): (7.00, 2.00, 3, 12, "EU single market. No customs."),
        ("GB", "US"): (12.00, 3.50, 5, 28, "US customs duties apply. Well-established lane."),
        ("GB", "DE"): (8.50, 2.20, 3, 14, "Post-Brexit EU customs apply. Short transit."),
        ("GB", "AU"): (13.50, 3.80, 6, 35, "UK-Australia FTA benefits. GST 10%."),
        ("GB", "JP"): (13.50, 3.80, 5, 35, "UK-Japan CEPA preferential rates."),
        ("GB", "CA"): (11.00, 3.00, 4, 22, "UK-Canada continuity agreement. GST/HST applies."),
        ("GB", "IN"): (12.00, 3.00, 6, 30, "Indian customs duties vary significantly. Complex regulations."),
        ("GB", "FR"): (7.50, 2.00, 2, 10, "Post-Brexit EU customs apply. Short transit via Channel."),
        ("GB", "NL"): (7.50, 2.00, 2, 10, "Post-Brexit EU customs. Short sea crossing."),
        ("GB", "CN"): (11.00, 2.80, 6, 33, "Chinese customs duties apply."),
        ("GB", "KR"): (13.00, 3.50, 5, 33, "UK-Korea FTA benefits."),
        ("GB", "IE"): (7.00, 1.80, 2, 8, "Very short transit. NI protocol considerations."),
        ("IN", "US"): (12.00, 2.80, 6, 32, "US customs duties apply. GSP program expired but some benefits."),
        ("IN", "GB"): (11.00, 2.50, 6, 28, "UK customs apply. India-UK FTA negotiations ongoing."),
        ("IN", "AE"): (8.00, 1.80, 4, 18, "India-UAE CEPA benefits. Short transit. Major trade lane."),
        ("IN", "SG"): (9.00, 2.00, 4, 16, "India-Singapore CECA benefits."),
        ("IN", "DE"): (12.00, 3.00, 6, 30, "EU customs apply. Growing trade corridor."),
        ("IN", "JP"): (11.00, 2.80, 5, 28, "India-Japan CEPA benefits."),
        ("IN", "AU"): (11.00, 2.80, 5, 24, "India-Australia ECTA benefits. GST 10%."),
        ("IN", "CN"): (9.00, 2.20, 5, 26, "Chinese customs duties apply."),
        ("IN", "KR"): (10.00, 2.50, 5, 24, "India-Korea CEPA benefits."),
        ("VN", "US"): (11.00, 2.50, 6, 30, "Growing trade lane. US customs duties apply."),
        ("VN", "JP"): (8.00, 1.80, 3, 16, "RCEP and AJCEP benefits. Short transit."),
        ("VN", "KR"): (8.00, 1.80, 3, 14, "KVFTA benefits. Short transit."),
        ("VN", "CN"): (5.50, 1.20, 2, 10, "ACFTA and RCEP benefits. Very close proximity."),
        ("VN", "DE"): (12.00, 3.00, 7, 33, "EU-Vietnam FTA benefits."),
        ("VN", "AU"): (10.00, 2.50, 5, 22, "Growing trade lane. GST 10%."),
        ("TH", "US"): (12.00, 2.80, 5, 28, "Thai goods may qualify for GSP. US customs apply."),
        ("TH", "JP"): (8.50, 2.00, 3, 16, "JTEPA benefits. Short transit."),
        ("TH", "CN"): (6.00, 1.30, 3, 16, "ACFTA benefits."),
        ("TH", "AU"): (10.00, 2.50, 5, 22, "TAFTA benefits. GST 10%."),
        ("TW", "US"): (12.00, 3.00, 4, 26, "US customs apply. Strong electronics trade lane."),
        ("TW", "JP"): (8.00, 1.80, 2, 12, "Short transit. Major trade partner."),
        ("TW", "CN"): (6.00, 1.20, 2, 10, "Cross-strait trade. Short transit."),
        ("FR", "US"): (12.50, 3.50, 5, 28, "US customs duties apply."),
        ("FR", "GB"): (7.50, 2.00, 2, 10, "Post-Brexit customs. Channel crossing."),
        ("FR", "DE"): (6.50, 1.80, 2, 10, "EU single market. No customs."),
        ("FR", "CN"): (10.00, 2.50, 6, 33, "Chinese customs duties apply."),
        ("IT", "US"): (13.00, 3.60, 5, 28, "US customs duties apply."),
        ("IT", "DE"): (7.00, 2.00, 2, 12, "EU single market. No customs."),
        ("IT", "GB"): (8.50, 2.30, 3, 16, "Post-Brexit UK customs apply."),
        ("IT", "FR"): (6.50, 1.80, 2, 10, "EU single market. No customs."),
        ("CA", "US"): (7.50, 2.00, 2, 8, "USMCA duty-free for qualifying goods. Shortest transit."),
        ("CA", "GB"): (11.00, 3.00, 4, 22, "UK-Canada continuity agreement."),
        ("CA", "CN"): (11.00, 2.80, 6, 28, "Chinese customs duties apply."),
        ("CA", "JP"): (12.00, 3.20, 4, 22, "CPTPP benefits."),
        ("MX", "US"): (8.50, 2.50, 2, 10, "USMCA benefits. Very short transit. Major trade lane."),
        ("MX", "CA"): (10.00, 3.00, 3, 18, "USMCA benefits."),
        ("MX", "DE"): (13.00, 3.50, 6, 30, "EU-Mexico FTA benefits."),
        ("BR", "US"): (14.00, 3.50, 6, 25, "US customs duties apply. Growing e-commerce trade."),
        ("BR", "DE"): (14.00, 3.80, 7, 32, "EU customs apply."),
        ("BR", "CN"): (13.00, 3.20, 8, 35, "Chinese customs apply. Major commodity trade."),
        ("AU", "US"): (14.00, 3.80, 5, 28, "AUSFTA benefits. US customs apply."),
        ("AU", "NZ"): (8.00, 2.00, 2, 8, "CER agreement. Very short transit."),
        ("AU", "JP"): (12.00, 3.00, 4, 18, "JAEPA benefits. Major trade partner."),
        ("AU", "SG"): (10.00, 2.50, 4, 14, "SAFTA benefits. Singapore mostly duty-free."),
        ("AU", "GB"): (13.50, 3.80, 6, 35, "UK-Australia FTA benefits."),
        ("AU", "CN"): (10.00, 2.50, 5, 22, "ChAFTA benefits."),
        ("AU", "IN"): (11.00, 2.80, 5, 24, "India-Australia ECTA benefits."),
        ("AU", "KR"): (11.00, 2.80, 4, 20, "KAFTA benefits."),
        ("ID", "US"): (13.00, 3.00, 6, 30, "US customs apply."),
        ("ID", "JP"): (9.00, 2.00, 4, 18, "IJEPA benefits."),
        ("ID", "CN"): (7.00, 1.50, 4, 20, "ACFTA benefits."),
        ("ID", "AU"): (10.00, 2.50, 4, 16, "IA-CEPA benefits. GST 10%."),
        ("TR", "US"): (13.00, 3.50, 5, 30, "US customs apply."),
        ("TR", "DE"): (9.00, 2.30, 4, 20, "Customs union with EU for industrial goods."),
        ("TR", "GB"): (10.00, 2.80, 4, 24, "UK-Turkey FTA benefits."),
        ("NL", "US"): (12.00, 3.20, 4, 26, "Rotterdam hub advantage. US customs apply."),
        ("NL", "GB"): (7.50, 2.00, 2, 10, "Post-Brexit UK customs. Short sea crossing."),
        ("NL", "DE"): (5.50, 1.50, 1, 6, "EU single market. No customs. Very short transit."),
        ("ES", "US"): (13.00, 3.60, 5, 28, "US customs apply."),
        ("ES", "GB"): (8.50, 2.30, 3, 16, "Post-Brexit UK customs."),
        ("ES", "DE"): (7.50, 2.00, 3, 14, "EU single market. No customs."),
        ("ES", "FR"): (6.50, 1.80, 2, 10, "EU single market. No customs."),
    }

    # Geographic coordinates for distance calculation (lat, lon)
    COORDS = {
        "US": (38.9, -77.0), "CN": (31.2, 121.5), "KR": (37.6, 127.0),
        "JP": (35.7, 139.7), "DE": (50.1, 8.7), "GB": (51.5, -0.1),
        "IN": (19.1, 72.9), "VN": (10.8, 106.6), "TH": (13.8, 100.5),
        "TW": (25.0, 121.5), "FR": (48.9, 2.3), "IT": (41.9, 12.5),
        "CA": (43.7, -79.4), "MX": (19.4, -99.1), "BR": (-23.5, -46.6),
        "AU": (-33.9, 151.2), "ID": (-6.2, 106.8), "TR": (41.0, 29.0),
        "NL": (52.4, 4.9), "ES": (40.4, -3.7),
        # Destination-only extras
        "SE": (59.3, 18.1), "SG": (1.3, 103.8), "AE": (25.3, 55.3),
        "SA": (21.5, 39.2), "ZA": (-33.9, 18.4), "PL": (52.2, 21.0),
        "BE": (50.8, 4.3), "IE": (53.3, -6.3), "NZ": (-36.8, 174.8),
        "NO": (59.9, 10.8), "DK": (55.7, 12.6),
    }

    # 20 origin countries
    ORIGINS = ["US", "CN", "KR", "JP", "DE", "GB", "IN", "VN", "TH", "TW",
               "FR", "IT", "CA", "MX", "BR", "AU", "ID", "TR", "NL", "ES"]

    # 30 destination countries
    DESTS = ["US", "GB", "DE", "FR", "CA", "AU", "JP", "KR", "CN", "IN",
             "BR", "MX", "NL", "ES", "IT", "SE", "SG", "AE", "SA", "ZA",
             "TH", "VN", "ID", "TR", "PL", "BE", "IE", "NZ", "NO", "DK"]

    # Country name lookup from countries list
    country_names = {}
    for row in conn.execute("SELECT code, name FROM countries").fetchall():
        country_names[row[0]] = row[1]

    # VAT/tax info for destination countries
    dest_vat = {
        "US": "US customs duties vary by product. De minimis $800.",
        "GB": "UK customs duty + VAT 20%.",
        "DE": "German customs + VAT (MwSt) 19%.",
        "FR": "French customs + TVA 20%.",
        "CA": "Canadian customs + GST/HST. CUSMA may apply.",
        "AU": "Australian GST 10% on imports over AUD1000.",
        "JP": "Japan consumption tax 10%. Customs duty varies.",
        "KR": "Korea customs duty + VAT 10%.",
        "CN": "Chinese customs duties vary. Cross-border e-commerce rates apply.",
        "IN": "Indian customs duties vary (0-150%). GST applies.",
        "BR": "Brazilian import taxes total 60%+ on many goods.",
        "MX": "Mexican customs duties vary. IVA 16%.",
        "NL": "Netherlands follows EU customs. BTW 21%.",
        "ES": "Spanish customs follow EU tariff. IVA 21%.",
        "IT": "Italian customs follow EU tariff. IVA 22%.",
        "SE": "Swedish customs follow EU tariff. Moms 25%.",
        "SG": "Singapore has no customs duty on most goods. GST 9%.",
        "AE": "UAE VAT 5%. Customs duty 5% standard rate.",
        "SA": "Saudi customs duty 5-20%. VAT 15%.",
        "ZA": "South African customs duties vary. VAT 15%.",
        "TH": "Thai customs duties vary. VAT 7%.",
        "VN": "Vietnam customs duties vary. VAT 10%.",
        "ID": "Indonesian customs duties vary. VAT 11%.",
        "TR": "Turkish customs duties vary. KDV 20%.",
        "PL": "Polish customs follow EU tariff. VAT 23%.",
        "BE": "Belgian customs follow EU tariff. BTW 21%.",
        "IE": "Irish customs follow EU tariff. VAT 23%.",
        "NZ": "New Zealand GST 15%. Customs duties apply.",
        "NO": "Norwegian customs + MVA 25%. Not EU member.",
        "DK": "Danish customs follow EU tariff. Moms 25%.",
    }

    # EU member codes (intra-EU = no customs)
    EU = {"DE", "FR", "NL", "ES", "IT", "SE", "PL", "BE", "IE", "NO", "DK",
          "AT", "CZ", "PT", "GR", "HU", "RO", "BG", "HR", "SK", "SI",
          "LT", "LV", "EE", "LU", "MT", "CY", "FI"}
    # Note: NO is EEA not EU, but treated similarly for shipping simplicity

    def haversine(c1, c2):
        """Distance in km between two (lat, lon) pairs."""
        lat1, lon1 = math.radians(c1[0]), math.radians(c1[1])
        lat2, lon2 = math.radians(c2[0]), math.radians(c2[1])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        return 6371 * 2 * math.asin(math.sqrt(a))

    def deterministic_noise(origin, dest, seed_str):
        """Small deterministic variation based on route pair."""
        h = int(hashlib.md5(f"{origin}-{dest}-{seed_str}".encode()).hexdigest()[:8], 16)
        return (h % 100 - 50) / 100.0  # -0.50 to +0.49

    def generate_route(origin, dest):
        """Generate realistic shipping data based on distance and country characteristics."""
        if origin not in COORDS or dest not in COORDS:
            return None
        dist = haversine(COORDS[origin], COORDS[dest])

        # Both in EU = much cheaper, faster
        intra_eu = origin in EU and dest in EU

        if intra_eu:
            # Intra-EU: short distances, no customs
            air_cost = round(5.50 + dist / 3000 * 3.0 + deterministic_noise(origin, dest, "ac") * 0.5, 2)
            sea_cost = round(1.30 + dist / 3000 * 1.5 + deterministic_noise(origin, dest, "sc") * 0.3, 2)
            air_days = max(1, round(1 + dist / 3000 * 2 + deterministic_noise(origin, dest, "ad") * 0.5))
            sea_days = max(4, round(5 + dist / 1000 * 3 + deterministic_noise(origin, dest, "sd") * 1))
            notes = f"EU single market. No customs duties between {country_names.get(origin, origin)} and {country_names.get(dest, dest)}."
        else:
            # Base cost scales with distance
            air_base = 8.0 + dist / 2000 * 4.0
            sea_base = 1.80 + dist / 2000 * 1.5

            # Adjust for origin cost factor (cheaper origins like CN, VN)
            origin_factor = {
                "CN": 0.70, "VN": 0.75, "TH": 0.78, "ID": 0.80, "IN": 0.80,
                "TW": 0.82, "KR": 0.88, "MX": 0.85, "TR": 0.85,
                "BR": 1.05, "AU": 1.05, "JP": 1.00, "US": 1.00,
                "DE": 0.95, "GB": 0.95, "FR": 0.97, "IT": 0.98,
                "NL": 0.93, "ES": 0.97, "CA": 0.95,
            }.get(origin, 1.0)

            air_cost = round(air_base * origin_factor + deterministic_noise(origin, dest, "ac") * 1.0, 2)
            sea_cost = round(sea_base * origin_factor + deterministic_noise(origin, dest, "sc") * 0.3, 2)
            air_days = max(2, round(2 + dist / 3000 * 4 + deterministic_noise(origin, dest, "ad") * 0.5))
            sea_days = max(8, round(8 + dist / 1000 * 2.5 + deterministic_noise(origin, dest, "sd") * 2))

            dest_name = country_names.get(dest, dest)
            origin_name = country_names.get(origin, origin)
            notes = dest_vat.get(dest, f"Customs duties for {dest_name} vary by product category.")

        # Clamp to reasonable ranges
        air_cost = max(5.0, min(20.0, air_cost))
        sea_cost = max(1.0, min(6.0, sea_cost))
        air_days = max(1, min(12, air_days))
        sea_days = max(4, min(45, sea_days))

        return (air_cost, sea_cost, air_days, sea_days, notes)

    inserted = set()
    # First insert curated routes
    for (origin, dest), (air_cost, sea_cost, air_days, sea_days, notes) in curated.items():
        slug = f"{origin.lower()}-to-{dest.lower()}"
        conn.execute(
            "INSERT INTO routes (origin_code, dest_code, slug, avg_cost_kg_air, avg_cost_kg_sea, avg_days_air, avg_days_sea, customs_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (origin, dest, slug, air_cost, sea_cost, air_days, sea_days, notes)
        )
        inserted.add((origin, dest))

    # Then generate remaining routes
    for origin in ORIGINS:
        for dest in DESTS:
            if origin == dest:
                continue
            if (origin, dest) in inserted:
                continue
            data = generate_route(origin, dest)
            if data is None:
                continue
            air_cost, sea_cost, air_days, sea_days, notes = data
            slug = f"{origin.lower()}-to-{dest.lower()}"
            conn.execute(
                "INSERT INTO routes (origin_code, dest_code, slug, avg_cost_kg_air, avg_cost_kg_sea, avg_days_air, avg_days_sea, customs_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (origin, dest, slug, air_cost, sea_cost, air_days, sea_days, notes)
            )
            inserted.add((origin, dest))


def insert_ports(conn: sqlite3.Connection):
    ports = [
        # US
        ("US", "Port of Los Angeles", "sea", "port-of-los-angeles"),
        ("US", "Port of Long Beach", "sea", "port-of-long-beach"),
        ("US", "Port of New York/New Jersey", "sea", "port-of-new-york-new-jersey"),
        ("US", "Port of Savannah", "sea", "port-of-savannah"),
        ("US", "Port of Houston", "sea", "port-of-houston"),
        ("US", "Port of Charleston", "sea", "port-of-charleston"),
        ("US", "Port of Seattle/Tacoma", "sea", "port-of-seattle-tacoma"),
        ("US", "Port of Oakland", "sea", "port-of-oakland"),
        ("US", "Port of Miami", "sea", "port-of-miami"),
        ("US", "JFK International Airport", "air", "jfk-international-airport"),
        ("US", "O'Hare International Airport", "air", "ohare-international-airport"),
        ("US", "Los Angeles International Airport", "air", "los-angeles-international-airport"),
        ("US", "Miami International Airport", "air", "miami-international-airport"),
        ("US", "Memphis International Airport (FedEx Hub)", "air", "memphis-international-airport"),
        ("US", "Louisville Muhammad Ali Airport (UPS Hub)", "air", "louisville-muhammad-ali-airport"),
        # China
        ("CN", "Port of Shanghai", "sea", "port-of-shanghai"),
        ("CN", "Port of Shenzhen", "sea", "port-of-shenzhen"),
        ("CN", "Port of Ningbo-Zhoushan", "sea", "port-of-ningbo-zhoushan"),
        ("CN", "Port of Guangzhou", "sea", "port-of-guangzhou"),
        ("CN", "Port of Qingdao", "sea", "port-of-qingdao"),
        ("CN", "Port of Tianjin", "sea", "port-of-tianjin"),
        ("CN", "Port of Xiamen", "sea", "port-of-xiamen"),
        ("CN", "Shanghai Pudong International Airport", "air", "shanghai-pudong-international-airport"),
        ("CN", "Guangzhou Baiyun Airport", "air", "guangzhou-baiyun-airport"),
        ("CN", "Shenzhen Bao'an Airport", "air", "shenzhen-baoan-airport"),
        # South Korea
        ("KR", "Port of Busan", "sea", "port-of-busan"),
        ("KR", "Port of Incheon", "sea", "port-of-incheon"),
        ("KR", "Incheon International Airport", "air", "incheon-international-airport"),
        # Japan
        ("JP", "Port of Tokyo", "sea", "port-of-tokyo"),
        ("JP", "Port of Yokohama", "sea", "port-of-yokohama"),
        ("JP", "Port of Kobe", "sea", "port-of-kobe"),
        ("JP", "Port of Osaka", "sea", "port-of-osaka"),
        ("JP", "Port of Nagoya", "sea", "port-of-nagoya"),
        ("JP", "Narita International Airport", "air", "narita-international-airport"),
        ("JP", "Kansai International Airport", "air", "kansai-international-airport"),
        # UK
        ("GB", "Port of Felixstowe", "sea", "port-of-felixstowe"),
        ("GB", "Port of Southampton", "sea", "port-of-southampton"),
        ("GB", "London Gateway", "sea", "london-gateway"),
        ("GB", "Heathrow Airport", "air", "heathrow-airport"),
        ("GB", "East Midlands Airport (DHL Hub)", "air", "east-midlands-airport"),
        # Germany
        ("DE", "Port of Hamburg", "sea", "port-of-hamburg"),
        ("DE", "Port of Bremerhaven", "sea", "port-of-bremerhaven"),
        ("DE", "Frankfurt Airport", "air", "frankfurt-airport"),
        ("DE", "Leipzig/Halle Airport (DHL Hub)", "air", "leipzig-halle-airport"),
        # Netherlands
        ("NL", "Port of Rotterdam", "sea", "port-of-rotterdam"),
        ("NL", "Port of Amsterdam", "sea", "port-of-amsterdam"),
        ("NL", "Schiphol Airport", "air", "schiphol-airport"),
        # Singapore
        ("SG", "Port of Singapore", "sea", "port-of-singapore"),
        ("SG", "Changi Airport", "air", "changi-airport"),
        # UAE
        ("AE", "Jebel Ali Port", "sea", "jebel-ali-port"),
        ("AE", "Dubai International Airport", "air", "dubai-international-airport"),
        ("AE", "Al Maktoum International Airport", "air", "al-maktoum-international-airport"),
        # Australia
        ("AU", "Port of Melbourne", "sea", "port-of-melbourne"),
        ("AU", "Port of Sydney", "sea", "port-of-sydney"),
        ("AU", "Port of Brisbane", "sea", "port-of-brisbane"),
        ("AU", "Sydney Airport", "air", "sydney-airport"),
        ("AU", "Melbourne Airport", "air", "melbourne-airport"),
        # India
        ("IN", "Nhava Sheva (JNPT)", "sea", "nhava-sheva-jnpt"),
        ("IN", "Port of Chennai", "sea", "port-of-chennai"),
        ("IN", "Port of Mundra", "sea", "port-of-mundra"),
        ("IN", "Delhi Indira Gandhi Airport", "air", "delhi-indira-gandhi-airport"),
        ("IN", "Mumbai Chhatrapati Shivaji Airport", "air", "mumbai-chhatrapati-shivaji-airport"),
        # Brazil
        ("BR", "Port of Santos", "sea", "port-of-santos"),
        ("BR", "Port of Paranagua", "sea", "port-of-paranagua"),
        ("BR", "Guarulhos International Airport", "air", "guarulhos-international-airport"),
        # France
        ("FR", "Port of Le Havre", "sea", "port-of-le-havre"),
        ("FR", "Port of Marseille", "sea", "port-of-marseille"),
        ("FR", "Charles de Gaulle Airport", "air", "charles-de-gaulle-airport"),
        # Canada
        ("CA", "Port of Vancouver", "sea", "port-of-vancouver"),
        ("CA", "Port of Montreal", "sea", "port-of-montreal"),
        ("CA", "Toronto Pearson Airport", "air", "toronto-pearson-airport"),
        # Others
        ("HK", "Port of Hong Kong", "sea", "port-of-hong-kong"),
        ("HK", "Hong Kong International Airport", "air", "hong-kong-international-airport"),
        ("TW", "Port of Kaohsiung", "sea", "port-of-kaohsiung"),
        ("TW", "Taoyuan International Airport", "air", "taoyuan-international-airport"),
        ("MY", "Port Klang", "sea", "port-klang"),
        ("TH", "Laem Chabang Port", "sea", "laem-chabang-port"),
        ("VN", "Port of Ho Chi Minh City", "sea", "port-of-ho-chi-minh-city"),
        ("ID", "Port of Tanjung Priok", "sea", "port-of-tanjung-priok"),
        ("PH", "Port of Manila", "sea", "port-of-manila"),
        ("SA", "Jeddah Islamic Port", "sea", "jeddah-islamic-port"),
        ("ZA", "Port of Durban", "sea", "port-of-durban"),
        ("EG", "Port of Alexandria", "sea", "port-of-alexandria"),
        ("TR", "Port of Ambarli", "sea", "port-of-ambarli"),
        ("IT", "Port of Genoa", "sea", "port-of-genoa"),
        ("ES", "Port of Valencia", "sea", "port-of-valencia"),
        ("ES", "Port of Barcelona", "sea", "port-of-barcelona"),
        ("BE", "Port of Antwerp-Bruges", "sea", "port-of-antwerp-bruges"),
        ("PA", "Panama Canal Ports", "sea", "panama-canal-ports"),
        ("MX", "Port of Manzanillo", "sea", "port-of-manzanillo"),
        ("CL", "Port of San Antonio", "sea", "port-of-san-antonio"),
        ("AR", "Port of Buenos Aires", "sea", "port-of-buenos-aires"),
        ("NZ", "Port of Auckland", "sea", "port-of-auckland"),
        ("PK", "Port of Karachi", "sea", "port-of-karachi"),
        ("BD", "Port of Chittagong", "sea", "port-of-chittagong"),
        ("NG", "Port of Lagos (Apapa)", "sea", "port-of-lagos-apapa"),
        ("KE", "Port of Mombasa", "sea", "port-of-mombasa"),
    ]

    for p in ports:
        code, name, ptype, slug = p
        conn.execute(
            "INSERT INTO port_info (country_code, port_name, port_type, slug) VALUES (?, ?, ?, ?)",
            (code, name, ptype, slug)
        )


def main():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    try:
        create_tables(conn)
        insert_countries(conn)
        insert_carriers(conn)
        insert_routes(conn)
        insert_ports(conn)
        conn.commit()

        # Print stats
        for table in ['countries', 'carriers', 'routes', 'port_info']:
            count = conn.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
            print(f"  {table}: {count} rows")

        print("Database built successfully!")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
