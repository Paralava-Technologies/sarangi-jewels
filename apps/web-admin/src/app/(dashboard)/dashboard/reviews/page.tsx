'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { fetchReviews, updateReviewStatus, deleteReview } from '@/lib/api';
import type { ReviewResponse } from '@sarangi/shared-types';
import { Pagination } from '@/components/Pagination';

export default function ReviewsPage(): React.JSX.Element {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetchReviews(page, 20);
      setReviews(res.data);
      setTotalPages(res.meta.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING') => {
    try {
      await updateReviewStatus(id, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await deleteReview(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Product Reviews</h1>
      <p className="mt-2 text-sm text-neutral-600">Moderate and manage customer reviews.</p>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      {loading ? (
        <p className="mt-8 text-sm text-neutral-500">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">No reviews found.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-lg border border-neutral-200">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Comment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-b border-neutral-100">
                  <td className="px-4 py-3 font-medium">{review.product?.name}</td>
                  <td className="px-4 py-3">
                    <p>{review.user?.firstName} {review.user?.lastName}</p>
                    <p className="text-xs text-neutral-500">{review.user?.email}</p>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-neutral-300'}>★</span>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 max-w-xs truncate" title={review.comment || ''}>
                    {review.comment || <em className="text-neutral-400">No comment</em>}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={review.status}
                      onChange={(e) => handleStatusChange(review.id, e.target.value as any)}
                      className={`text-xs font-medium rounded-full px-2 py-1 border ${
                        review.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                        review.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                      }`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-sm font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
