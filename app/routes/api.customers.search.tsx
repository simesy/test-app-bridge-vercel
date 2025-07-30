import { json, type LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");

  if (!query) {
    return json({ customers: [] });
  }

  // TODO: Replace with actual customer search logic
  // This is a mock response for now
  const mockCustomers = [
    {
      id: "1",
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      phone: "+1234567890"
    },
    {
      id: "2",
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@example.com",
      phone: "+0987654321"
    }
  ];

  // Filter customers based on query (mock search)
  const filteredCustomers = mockCustomers.filter(customer =>
    customer.first_name.toLowerCase().includes(query.toLowerCase()) ||
    customer.last_name.toLowerCase().includes(query.toLowerCase()) ||
    customer.email.toLowerCase().includes(query.toLowerCase()) ||
    (customer.phone && customer.phone.includes(query))
  );

  return json({ customers: filteredCustomers });
}