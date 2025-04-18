import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { EditAuthor } from "../../../../components/admin/authors/EditAuthor";
import AdminService from "../../../../services/adminService";

// Mock dependencies
vi.mock("../../../../services/adminService", () => ({
  default: {
    getAuthorById: vi.fn(),
    updateAuthor: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock navigate function
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "1" }),
  };
});

describe("EditAuthor", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for getAuthorById
    vi.mocked(AdminService.getAuthorById).mockResolvedValue({
      author: {
        id: 1,
        name: "Author One",
        biography: "Bio",
        birth_date: "1980-01-01",
        photo_url: "http://example.com/photo1.jpg",
      },
      books: [],
    });
  });

  it("shows validation error if name is missing", async () => {
    render(
      <MemoryRouter>
        <EditAuthor />
      </MemoryRouter>
    );

    // Wait for the form to be populated
    await waitFor(() => {
      expect(screen.getByDisplayValue("Author One")).toBeInTheDocument();
    });

    // Clear the name field
    const nameInput = screen.getByLabelText(/name \*/i);
    fireEvent.change(nameInput, { target: { value: "" } });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    // Wait for and check the validation message
    await waitFor(() => {
      const errorMessage = screen.getByText("Author name is required");
      expect(errorMessage).toBeInTheDocument();
    });

    // Verify that the API call was not made
    expect(AdminService.updateAuthor).not.toHaveBeenCalled();
  });
});
