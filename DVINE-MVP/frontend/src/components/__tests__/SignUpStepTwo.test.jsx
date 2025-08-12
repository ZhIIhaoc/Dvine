import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "../../test/utils/test-utils";
import userEvent from "@testing-library/user-event";
import SignUpStepTwo from "../SignUpStepTwo";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe("SignUpStepTwo", () => {
    const user = userEvent.setup();
    const mockChangeState = vi.fn();
    const mockConfirmEmail = vi.fn();
    const mockPageBack = vi.fn();

    const defaultProps = {
        userInfo: {
            firstName: "John",
            lastName: "Doe",
            phone: "1234567890",
            postcode: "2000",
            email: "john@example.com",
        },
        changeState: mockChangeState,
        confirmEmail: mockConfirmEmail,
        pageBack: mockPageBack,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
        cleanup(); // Clean up DOM after each test
    });

    afterEach(() => {
        vi.restoreAllMocks();
        cleanup(); // Clean up DOM after each test
    });

    it("renders signup step two without crashing", () => {
        render(<SignUpStepTwo {...defaultProps} />);
        expect(screen.getByText(/create an account/i)).toBeInTheDocument();
    });

    it("displays all form fields", () => {
        render(<SignUpStepTwo {...defaultProps} />);

        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/postcode/i)).toBeInTheDocument();
    });

    it("displays stepper with correct active step", () => {
        render(<SignUpStepTwo {...defaultProps} />);

        // Check that stepper is present (Material-UI Stepper doesn't have progressbar role)
        expect(screen.getByText("2")).toBeInTheDocument(); // Step 2 should be active
    });

    it("displays navigation buttons", () => {
        render(<SignUpStepTwo {...defaultProps} />);

        expect(
            screen.getByRole("button", { name: /back/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /sign up/i })
        ).toBeInTheDocument();
    });

    it("calls changeState when first name field is changed", async () => {
        render(<SignUpStepTwo {...defaultProps} />);

        const firstNameField = screen.getByLabelText(/first name/i);
        await user.type(firstNameField, "John");

        expect(mockChangeState).toHaveBeenCalledWith("firstName");
    });

    it("calls changeState when last name field is changed", async () => {
        render(<SignUpStepTwo {...defaultProps} />);

        const lastNameField = screen.getByLabelText(/last name/i);
        await user.type(lastNameField, "Doe");

        expect(mockChangeState).toHaveBeenCalledWith("lastName");
    });

    it("calls changeState when phone field is changed", async () => {
        render(<SignUpStepTwo {...defaultProps} />);

        const phoneField = screen.getByLabelText(/phone number/i);
        await user.type(phoneField, "1234567890");

        expect(mockChangeState).toHaveBeenCalledWith("phone");
    });

    it("calls changeState when postcode field is changed", async () => {
        render(<SignUpStepTwo {...defaultProps} />);

        const postcodeField = screen.getByLabelText(/postcode/i);
        await user.type(postcodeField, "2000");

        expect(mockChangeState).toHaveBeenCalledWith("postcode");
    });

    it("calls confirmEmail when Sign Up button is clicked", async () => {
        render(<SignUpStepTwo {...defaultProps} />);

        const signUpButton = screen.getByRole("button", { name: /sign up/i });
        await user.click(signUpButton);

        expect(mockConfirmEmail).toHaveBeenCalled();
    });

    it("calls pageBack when Back button is clicked", async () => {
        render(<SignUpStepTwo {...defaultProps} />);

        const backButton = screen.getByRole("button", { name: /back/i });
        await user.click(backButton);

        expect(mockPageBack).toHaveBeenCalled();
    });

    it("displays user info in form fields", () => {
        const propsWithUserInfo = {
            ...defaultProps,
            userInfo: {
                firstName: "John",
                lastName: "Doe",
                phone: "1234567890",
                postcode: "2000",
            },
        };

        render(<SignUpStepTwo {...propsWithUserInfo} />);

        expect(screen.getByDisplayValue("John")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
        expect(screen.getByDisplayValue("1234567890")).toBeInTheDocument();
        expect(screen.getByDisplayValue("2000")).toBeInTheDocument();
    });

    it("handles empty user info", () => {
        const propsWithEmptyInfo = {
            ...defaultProps,
            userInfo: {
                firstName: "",
                lastName: "",
                phone: "",
                postcode: "",
            },
        };

        render(<SignUpStepTwo {...propsWithEmptyInfo} />);

        // Should render without crashing with empty values
        expect(screen.getByLabelText(/first name/i)).toHaveValue("");
        expect(screen.getByLabelText(/last name/i)).toHaveValue("");
        expect(screen.getByLabelText(/phone number/i)).toHaveValue("");
        expect(screen.getByLabelText(/postcode/i)).toHaveValue("");
    });

    it("has proper form structure", () => {
        render(<SignUpStepTwo {...defaultProps} />);

        const firstNameField = screen.getByLabelText(/first name/i);
        const lastNameField = screen.getByLabelText(/last name/i);
        const phoneField = screen.getByLabelText(/phone number/i);
        const postcodeField = screen.getByLabelText(/postcode/i);

        expect(firstNameField).toBeInTheDocument();
        expect(lastNameField).toBeInTheDocument();
        expect(phoneField).toBeInTheDocument();
        expect(postcodeField).toBeInTheDocument();
    });
});
