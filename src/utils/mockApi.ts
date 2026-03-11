/** Mock API module — simulates backend response for dashboard generation */

export interface ChartData {
  title: string;
  description?: string;
  type: "line" | "bar" | "pie" | "area" | "kpi";
  data: Record<string, string | number>[];
  xKey?: string;
  yKey?: string;
  value?: number;
  change?: number;
  unit?: string;
}

export interface DashboardResponse {
  charts: ChartData[];
}

// Different mock responses based on query keywords
const mockResponses: Record<string, DashboardResponse> = {
  sales: {
    charts: [
      {
        title: "Total Revenue",
        description: "Year to date",
        type: "kpi",
        data: [],
        value: 284500,
        change: 12.5,
        unit: "$",
      },
      {
        title: "Monthly Sales Revenue",
        description: "Revenue trend over Q3 by region",
        type: "line",
        data: [
          { month: "Jul", North: 12000, South: 8500, East: 14000, West: 9200 },
          { month: "Aug", North: 13500, South: 9200, East: 15200, West: 10800 },
          { month: "Sep", North: 14200, South: 10100, East: 16800, West: 11500 },
        ],
        xKey: "month",
        yKey: "North",
      },
      {
        title: "Revenue by Region",
        description: "Comparative regional performance",
        type: "bar",
        data: [
          { region: "North", sales: 24000 },
          { region: "South", sales: 13980 },
          { region: "East", sales: 38000 },
          { region: "West", sales: 21500 },
        ],
        xKey: "region",
        yKey: "sales",
      },
      {
        title: "Product Category Distribution",
        description: "Revenue share by category",
        type: "pie",
        data: [
          { name: "Electronics", value: 4200 },
          { name: "Clothing", value: 3100 },
          { name: "Home & Garden", value: 2800 },
          { name: "Sports", value: 1900 },
        ],
      },
    ],
  },
  product: {
    charts: [
      {
        title: "Top Products Sold",
        description: "Units sold — Top 5",
        type: "kpi",
        data: [],
        value: 15230,
        change: 8.3,
        unit: "",
      },
      {
        title: "Top 5 Products by Revenue",
        description: "Best performing products this quarter",
        type: "bar",
        data: [
          { product: "Laptop Pro", revenue: 52000 },
          { product: "Wireless Earbuds", revenue: 38000 },
          { product: "Smart Watch", revenue: 31000 },
          { product: "Running Shoes", revenue: 24000 },
          { product: "Desk Lamp", revenue: 18000 },
        ],
        xKey: "product",
        yKey: "revenue",
      },
      {
        title: "Product Category Revenue",
        description: "2023 category comparison",
        type: "pie",
        data: [
          { name: "Electronics", value: 12000 },
          { name: "Clothing", value: 8500 },
          { name: "Home", value: 6200 },
          { name: "Sports", value: 4800 },
        ],
      },
    ],
  },
  trend: {
    charts: [
      {
        title: "Average Order Value",
        description: "Last 12 months",
        type: "kpi",
        data: [],
        value: 127,
        change: -2.1,
        unit: "$",
      },
      {
        title: "Sales Trend — Last 12 Months",
        description: "Monthly revenue with growth trajectory",
        type: "area",
        data: [
          { month: "Jan", revenue: 18000 },
          { month: "Feb", revenue: 21000 },
          { month: "Mar", revenue: 19500 },
          { month: "Apr", revenue: 24000 },
          { month: "May", revenue: 22800 },
          { month: "Jun", revenue: 27500 },
          { month: "Jul", revenue: 29000 },
          { month: "Aug", revenue: 31200 },
          { month: "Sep", revenue: 28400 },
          { month: "Oct", revenue: 33800 },
          { month: "Nov", revenue: 36500 },
          { month: "Dec", revenue: 41000 },
        ],
        xKey: "month",
        yKey: "revenue",
      },
      {
        title: "Revenue by Region",
        description: "Regional breakdown",
        type: "bar",
        data: [
          { region: "North", sales: 42000 },
          { region: "South", sales: 28000 },
          { region: "East", sales: 51000 },
          { region: "West", sales: 35000 },
        ],
        xKey: "region",
        yKey: "sales",
      },
    ],
  },
};

/** Simulate an API call with a delay */
export async function generateDashboard(query: string): Promise<DashboardResponse> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes("product") || lowerQuery.includes("category")) {
    return mockResponses.product;
  }
  if (lowerQuery.includes("trend") || lowerQuery.includes("12 month") || lowerQuery.includes("last")) {
    return mockResponses.trend;
  }
  // Default to sales
  return mockResponses.sales;
}
