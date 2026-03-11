import sqlite3
import pandas as pd
import random
import io
import threading


class DataService:
    """Manages CSV data in an in-memory SQLite database."""

    def __init__(self):
        self.conn = sqlite3.connect(":memory:", check_same_thread=False)
        self.table_name: str | None = None
        self.schema_info: dict | None = None
        self._lock = threading.Lock()

    def load_csv_bytes(self, file_content: bytes, filename: str) -> dict:
        df = pd.read_csv(io.BytesIO(file_content))
        table_name = self._sanitize_table_name(filename)
        return self._load_dataframe(df, table_name)

    def load_sample_data(self) -> dict:
        df = self._generate_sample_data()
        return self._load_dataframe(df, "sales")

    def _load_dataframe(self, df: pd.DataFrame, table_name: str) -> dict:
        with self._lock:
            if self.table_name:
                self.conn.execute(f'DROP TABLE IF EXISTS "{self.table_name}"')
            df.to_sql(table_name, self.conn, if_exists="replace", index=False)
            self.table_name = table_name
            self.schema_info = self._build_schema_info(table_name)
            return self.schema_info

    def get_schema(self) -> dict | None:
        return self.schema_info

    def execute_query(self, sql: str) -> list[dict]:
        with self._lock:
            try:
                df = pd.read_sql_query(sql, self.conn)
                for col in df.select_dtypes(include=["float64"]).columns:
                    df[col] = df[col].round(2)
                return df.to_dict(orient="records")
            except Exception as e:
                raise ValueError(f"SQL error: {e}")

    def get_sample_rows_text(self, n: int = 5) -> str:
        if not self.table_name:
            return ""
        df = pd.read_sql_query(
            f'SELECT * FROM "{self.table_name}" LIMIT {n}', self.conn
        )
        return df.to_markdown(index=False)

    def _build_schema_info(self, table_name: str) -> dict:
        cursor = self.conn.execute(f'PRAGMA table_info("{table_name}")')
        columns = [{"name": row[1], "type": row[2] or "TEXT"} for row in cursor.fetchall()]

        count_row = self.conn.execute(
            f'SELECT COUNT(*) FROM "{table_name}"'
        ).fetchone()
        row_count = count_row[0] if count_row else 0

        sample_df = pd.read_sql_query(
            f'SELECT * FROM "{table_name}" LIMIT 5', self.conn
        )

        return {
            "tableName": table_name,
            "columns": columns,
            "rowCount": row_count,
            "sampleData": sample_df.to_dict(orient="records"),
        }

    @staticmethod
    def _sanitize_table_name(filename: str) -> str:
        name = filename.rsplit(".", 1)[0]
        name = name.replace(" ", "_").replace("-", "_").lower()
        name = "".join(c for c in name if c.isalnum() or c == "_")
        return name or "data"

    @staticmethod
    def _generate_sample_data() -> pd.DataFrame:
        random.seed(42)
        rows = []

        regions = ["North", "South", "East", "West"]
        categories = {
            "Electronics": ["Laptop Pro", "Wireless Earbuds", "Smart Watch", "Tablet Air"],
            "Clothing": ["Running Shoes", "Winter Jacket", "Casual T-Shirt", "Denim Jeans"],
            "Home & Garden": ["Desk Lamp", "Air Purifier", "Plant Pot Set", "Smart Thermostat"],
            "Sports & Outdoors": ["Yoga Mat", "Mountain Bike", "Tennis Racket", "Camping Tent"],
            "Office Supplies": ["Ergonomic Chair", "Wireless Keyboard", "Monitor Stand", "Notebook Set"],
        }

        segments = ["Enterprise", "Small Business", "Consumer", "Government"]
        payments = ["Credit Card", "Bank Transfer", "PayPal", "Cash"]

        base_prices = {
            "Laptop Pro": 1200, "Wireless Earbuds": 80, "Smart Watch": 350, "Tablet Air": 600,
            "Running Shoes": 120, "Winter Jacket": 180, "Casual T-Shirt": 35, "Denim Jeans": 75,
            "Desk Lamp": 65, "Air Purifier": 280, "Plant Pot Set": 45, "Smart Thermostat": 250,
            "Yoga Mat": 40, "Mountain Bike": 800, "Tennis Racket": 150, "Camping Tent": 350,
            "Ergonomic Chair": 450, "Wireless Keyboard": 90, "Monitor Stand": 120, "Notebook Set": 25,
        }

        region_mult = {"North": 0.9, "South": 0.75, "East": 1.25, "West": 1.0}
        month_season = {
            1: 0.70, 2: 0.72, 3: 0.80, 4: 0.85, 5: 0.90, 6: 0.95,
            7: 1.00, 8: 1.02, 9: 1.05, 10: 1.12, 11: 1.35, 12: 1.55,
        }

        for month in range(1, 13):
            for region in regions:
                all_products = [
                    (cat, prod) for cat, prods in categories.items() for prod in prods
                ]
                selected = random.sample(
                    all_products, random.randint(10, min(16, len(all_products)))
                )

                for category, product in selected:
                    base_qty = max(1, int(random.gauss(12, 5)))
                    quantity = max(
                        1, int(base_qty * region_mult[region] * month_season[month])
                    )

                    unit_price = round(
                        base_prices[product] * random.uniform(0.92, 1.08), 2
                    )
                    revenue = round(quantity * unit_price, 2)
                    cost_ratio = random.uniform(0.42, 0.62)
                    cost = round(revenue * cost_ratio, 2)
                    profit = round(revenue - cost, 2)
                    day = random.randint(1, 28)

                    rows.append({
                        "order_date": f"2023-{month:02d}-{day:02d}",
                        "region": region,
                        "product_category": category,
                        "product_name": product,
                        "quantity": quantity,
                        "unit_price": unit_price,
                        "revenue": revenue,
                        "cost": cost,
                        "profit": profit,
                        "customer_segment": random.choice(segments),
                        "payment_method": random.choice(payments),
                    })

        df = pd.DataFrame(rows)
        df = df.sort_values("order_date").reset_index(drop=True)
        return df
