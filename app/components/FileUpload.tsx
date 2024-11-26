"use client";

import React, { useState } from "react";
import Papa, { ParseResult } from "papaparse";
import axios from "axios";
import { saveAs } from "file-saver";
import Confetti from "react-confetti";

interface CSVRow {
    [key: string]: string | undefined;
    normalizedDomain?: string;
}

interface MXRecordResponse {
    Answer?: Array<{ data: string }>;
}

const FileUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [processedData, setProcessedData] = useState<CSVRow[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [filteredCount, setFilteredCount] = useState<number>(0); // Tracks the number of filtered records
    const [showConfetti, setShowConfetti] = useState<boolean>(false); // Controls the confetti animation

    const normalizeDomain = (domain: string | undefined): string | undefined => {
        if (!domain) return undefined;
        const url = domain.trim().toLowerCase();
        return url.replace(/https?:\/\/|www\./g, "").split("/")[0];
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setFile(e.target.files?.[0] || null);
        setProcessedData(null);
        setError(null);
        setFilteredCount(0);
        setShowConfetti(false);
    };

    const processCSV = async (): Promise<void> => {
        if (!file) {
            alert("Please upload a file first!");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            Papa.parse<CSVRow>(file, {
                header: true,
                skipEmptyLines: true,
                complete: async (results: ParseResult<CSVRow>) => {
                    const data: CSVRow[] = results.data;

                    // Comprehensive list of potential domain-related column names
                    const domainColumnNames = [
                        "domain",
                        "website",
                        "url",
                        "web address",
                        "company website",
                        "company domain",
                        "business website",
                        "business domain",
                        "Domain",
                        "Website",
                        "URL",
                        "Web Address",
                        "Company Website",
                        "Company Domain",
                        "web_site",
                        "web-site",
                        "web.address",
                        "company_website",
                        "company.website",
                        "companydomain",
                        "businesswebsite",
                        "homepage",
                        "landing_page",
                        "primary_url",
                        "root_domain",
                        "site_url",
                        "website_url",
                        "corporate_site",
                        "corporate_url",
                        "organization_url",
                        "organization_site",
                        "company_url",
                        "business_url",
                    ];

                    // Find the column that matches one of the names in the list
                    const domainColumn = Object.keys(data[0] || {}).find((col) =>
                        domainColumnNames.includes(col.toLowerCase())
                    );

                    if (!domainColumn) {
                        setError(
                            "No domain-related column found. Please ensure your file includes one of the following: " +
                            domainColumnNames.join(", ")
                        );
                        setLoading(false);
                        return;
                    }

                    const normalizedData: CSVRow[] = data.map((row: CSVRow): CSVRow => ({
                        ...row,
                        normalizedDomain: normalizeDomain(row[domainColumn]),
                    }));

                    const filteredData: CSVRow[] = [];
                    let filteredRecords = 0;

                    for (const row of normalizedData) {
                        if (!row.normalizedDomain) continue;

                        try {
                            const response = await axios.get<MXRecordResponse>(
                                `https://dns.google/resolve?name=${row.normalizedDomain}&type=MX`
                            );
                            const mxRecords: string[] =
                                response.data.Answer?.map((record: { data: string }): string => record.data) || [];

                            const hasOutlook = mxRecords.some((record: string): boolean =>
                                record.includes(".outlook")
                            );

                            if (hasOutlook) {
                                filteredRecords += 1;
                            } else {
                                filteredData.push(row);
                            }
                        } catch (error) {
                            console.error("Error fetching MX records for:", row.normalizedDomain, error);
                        }
                    }

                    setProcessedData(filteredData);
                    setFilteredCount(filteredRecords);
                    setShowConfetti(true); // Trigger the confetti animation
                    setLoading(false);
                },
                error: (error: Error): void => {
                    setError("Error parsing the CSV file.");
                    setLoading(false);
                },
            });
        } catch (error) {
            setError("An error occurred while processing the file.");
            setLoading(false);
        }
    };

    const downloadCSV = (): void => {
        if (!processedData) return;

        const csv: string = Papa.unparse(processedData);
        const blob: Blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "filtered_data.csv");
    };

    return (
        <div className="flex flex-col items-center gap-6 p-6 sm:p-8 bg-gray-700 rounded-lg shadow-lg w-full max-w-lg relative">
            <h1 className="text-2xl sm:text-3xl font-semibold">File Upload</h1>

            {/* File Input */}
            <div className="flex flex-col items-center gap-4">
                <label
                    htmlFor="file-upload"
                    className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md text-center"
                >
                    Choose a CSV File
                </label>
                <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileUpload}
                />
                {file && <p className="text-sm text-gray-300">Selected File: {file.name}</p>}
            </div>

            {/* Process Button */}
            <button
                onClick={processCSV}
                disabled={!file || loading}
                className={`w-full px-4 py-2 rounded-md text-white font-medium ${loading || !file
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                    }`}
            >
                {loading ? "Processing..." : "Process CSV"}
            </button>

            {/* Loading Spinner */}
            {loading && (
                <div className="flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Error Message */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Success Message */}
            {!loading && filteredCount > 0 && (
                <p className="text-green-500 text-center">
                    🎉 You saved {filteredCount} API credits by filtering out records! 🎉
                </p>
            )}

            {/* Download Button */}
            {processedData && (
                <button
                    onClick={downloadCSV}
                    className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md"
                >
                    Download Filtered CSV
                </button>
            )}

            {/* Confetti Animation */}
            {showConfetti && (
                <Confetti />
            )}
        </div>
    );
};

export default FileUpload;
