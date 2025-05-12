import React from "react";
import { Refine } from "@refinedev/core";
import {
  ThemedLayoutV2,
  ErrorComponent,
  RefineThemes,
  useNotificationProvider,
  RefineSnackbarProvider,
} from "@refinedev/mui";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider } from "@mui/material/styles";
import routerProvider, {
  NavigateToResource,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router";
import { BrowserRouter, Routes, Route, Outlet } from "react-router";

import { PostList, PostCreate, PostEdit } from "../src/pages/posts";
import { SalesPipelineKanban } from "./pages/kanban/SalesPipelineKanban";
import { CompanyList, CompanyEdit, CompanyCreate } from "./pages/companies";
import { ContactList, ContactEdit, ContactCreate } from "./pages/contacts";
import { dataProvider } from "./providers/data-provider";
import { asiaRoboticaTheme } from "./theme";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={asiaRoboticaTheme}>
        <CssBaseline />
        <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
        <RefineSnackbarProvider>
          <Refine
            dataProvider={dataProvider}
            routerProvider={routerProvider}
            notificationProvider={useNotificationProvider}
            resources={[
              {
                name: "sales-pipeline",
                list: "/sales-pipeline",
                edit: "/sales-pipeline/edit/:id",
                create: "/sales-pipeline/create",
                meta: {
                  label: "Oportunidades",
                },
              },
              {
                name: "kanban",
                list: "/kanban",
                meta: {
                  label: "Proceso de ventas",
                },
              },
              {
                name: "companies",
                list: "/companies",
                create: "/companies/create",
                edit: "/companies/edit/:id",
                meta: { label: "Empresas" },
              },
              {
                name: "contacts",
                list: "/contacts",
                create: "/contacts/create",
                edit: "/contacts/edit/:id",
                meta: { label: "Contactos" },
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
            <Routes>
              <Route
                element={
                  <ThemedLayoutV2
                    Title={({ collapsed }) => (
                      <img
                        src={collapsed ? "/logo192.png" : "/logo_asiarob.jpg"}
                        alt="Asia Robótica"
                        style={{ height: 50, padding: 8 }}
                      />
                    )}
                  >
                    <Outlet />
                  </ThemedLayoutV2>
                }
              >
                <Route index element={<NavigateToResource resource="sales-pipeline" />} />

                <Route path="/sales-pipeline">
                  <Route index element={<PostList />} />
                  <Route path="create" element={<PostCreate />} />
                  <Route path="edit/:id" element={<PostEdit />} />
                </Route>

                <Route path="/kanban" element={<SalesPipelineKanban />} />

                <Route path="/companies">
                  <Route index element={<CompanyList />} />
                  <Route path="create" element={<CompanyCreate />} />
                  <Route path="edit/:id" element={<CompanyEdit />} />
                </Route>

                <Route path="/contacts">
                  <Route index element={<ContactList />} />
                  <Route path="create" element={<ContactCreate />} />
                  <Route path="edit/:id" element={<ContactEdit />} />
                </Route>

                <Route path="*" element={<ErrorComponent />} />
              </Route>
            </Routes>

            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </RefineSnackbarProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;