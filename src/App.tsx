import { Route, Routes } from "react-router-dom";
import DocumentPage from "@/pages/document/DocumentPage";
import HomePage from "@/pages/home/HomePage";
import NotFoundPage from "@/pages/not-found/NotFoundPage";
import PreviewsPage from "@/pages/previews/PreviewsPage";
import DocsLayout from "@@/layout/docs-layout/DocsLayout";

export default function App() {
  return (
    <Routes>
      <Route element={<DocsLayout />}>
        <Route index element={<HomePage />} />
        <Route path="documentos/:id" element={<DocumentPage />} />
        <Route path="previews" element={<PreviewsPage />} />
        <Route path=":lang/previews" element={<PreviewsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
