import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDocuments } from "@/config/content/content";
import DocsFooter from "@@/layout/docs-footer/DocsFooter";
import DocsHeader from "@@/layout/docs-header/DocsHeader";
import DocsSidebar from "@@/layout/docs-sidebar/DocsSidebar";

export default function DocsLayout() {
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation("docs");
  const documents = useDocuments();
  const home = pathname === "/";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    const name = t("layout.title");
    const previews = /^(\/[a-z]{2}-[A-Z]{2})?\/previews\/?$/.test(pathname);
    const title = previews ? t("previews.title") : (documents[pathname.split("/")[2]]?.title ?? t("notFound.title"));
    document.title = home ? name : `${title} | ${name}`;
  }, [pathname, home, documents, i18n.language, t]);

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-operational-shell focus:p-4">
        {t("layout.skipLink")}
      </a>
      <DocsHeader home={home} open={open} toggle={() => setOpen((value) => !value)} />
      <div className="flex flex-1 flex-col gap-4 px-4 pb-8 sm:px-8 md:flex-row">
        <DocsSidebar home={home} open={open} close={() => setOpen(false)} />
        <div id="content" className="flex min-w-0 flex-1 flex-col">
          <Outlet />
          <DocsFooter />
        </div>
      </div>
    </div>
  );
}
