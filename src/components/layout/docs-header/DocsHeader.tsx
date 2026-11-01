import { Link } from "react-router-dom";
import { IconArrowLeft, IconDownload, IconLayoutGrid } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { GitHubIcon, ToolbarAction } from "@solaria.network/web-lib";
import { LanguageSwitcher } from "./DocsHeader.reusable";

interface DocsHeaderProps {
  home: boolean;
  open: boolean;
  toggle: () => void;
}

const actionClass =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-small text-operational-ink transition-colors hover:bg-operational-hover focus-visible:outline-2 focus-visible:outline-operational-ink motion-reduce:transition-none";

export default function DocsHeader({ home, open, toggle }: DocsHeaderProps) {
  const { t } = useTranslation("docs");

  return (
    <header className="navbar-frame z-30 w-full justify-between gap-2 bg-operational-shell!">
      <div className="flex items-center gap-1 sm:gap-2">
        {!home && <Link to="/" aria-label={t("header.home")} title={t("header.home")} className={actionClass}><IconArrowLeft size={20} stroke={1.75} aria-hidden="true" /></Link>}
      <ToolbarAction
        className={home ? undefined : "md:hidden"}
        icon={open ? "panelLeftClose" : "panelLeftOpen"}
        label={open ? t("header.collapseMenu") : t("header.expandMenu")}
        aria-controls="docs-navigation"
        aria-expanded={open}
        onClick={toggle}
      />
      </div>
      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Link to="/previews" aria-label={t("header.previews")} title={t("header.previews")} className={actionClass}><IconLayoutGrid size={20} stroke={1.75} aria-hidden="true" /></Link>
        <a href="https://github.com/Solierrr/web-docs" aria-label={t("header.github")} title="GitHub" target="_blank" rel="noopener noreferrer" className={actionClass}>
          <GitHubIcon size={20} />
        </a>
        <a href="https://github.com/Solierrr/docs-reports/archive/refs/heads/main.zip" aria-label={t("header.downloadReports")} title={t("header.downloadReports")} className={actionClass}><IconDownload size={20} stroke={1.75} aria-hidden="true" /></a>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
