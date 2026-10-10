"use client";

import PetCard from "@/components/layout/pets/PetCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import usePets from "@/hooks/usePets";
import { useState } from "react";

export default function BrowsePetsPage() {
  const [pagenum, setPageNum] = useState(1);
  const [petsPerPage, setPetsPerPage] = useState(24);
  const { pets, lastPage, total, loading, error } = usePets(
    pagenum,
    petsPerPage,
  );

  return (
    <main className="min-w-0 flex-1 max-h-screen overflow-x-hidden overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Browse Pets</h1>
        <p className="text-muted-foreground">Find your next companion.</p>
        {!loading && !error && (
          <p className="mt-2 text-sm text-muted-foreground">
            Page {pagenum} of {lastPage} · {total} pets
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center">
          <p role="status">Loading pets...</p>
          <Spinner className="mx-auto mt-4 h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <p role="alert" className="text-destructive">
          Failed to load pets: {error}
        </p>
      ) : pets.length === 0 ? (
        <p>No pets found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
      <div className="sticky -bottom-6 left-0 right-0 bg-background p-4 flex justify-center">
        <Field orientation="horizontal" className="w-fit">
          <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel>
          <Select
            value={String(petsPerPage)}
            onValueChange={(value) => {
              if (value) {
                setPetsPerPage(Number(value));
                setPageNum(1);
              }
            }}
          >
            <SelectTrigger className="w-20" id="select-rows-per-page">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="48">48</SelectItem>
                <SelectItem value="96">96</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={pagenum <= 1}
                tabIndex={pagenum <= 1 ? -1 : undefined}
                className={
                  pagenum <= 1 ? "pointer-events-none opacity-50" : undefined
                }
                onClick={(event) => {
                  event.preventDefault();
                  if (pagenum > 1) {
                    setPageNum(pagenum - 1);
                  }
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={pagenum >= lastPage}
                tabIndex={pagenum >= lastPage ? -1 : undefined}
                className={
                  pagenum >= lastPage
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
                onClick={(event) => {
                  event.preventDefault();
                  if (pagenum < lastPage) {
                    setPageNum(pagenum + 1);
                  }
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </main>
  );
}
