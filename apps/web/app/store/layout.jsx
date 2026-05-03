import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "Singitronic - Store Dashboard",
    description: "Singitronic - Store Dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
