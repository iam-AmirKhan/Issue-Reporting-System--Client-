import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axiosClient";


const fetchAllIssues = async () => {
  const { data } = await api.get("/api/issues");
  return data;
};

export function useAllIssues() {
  return useQuery({
    queryKey: ["allIssues"],
    queryFn: fetchAllIssues,
    staleTime: 1000 * 60 * 2,
  });
}


export function useUpvoteIssue() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ issueId, userId }) => {
      const { data } = await api.post(`/api/issues/${issueId}/upvote`, { userId });
      return data;
    },
    onMutate: async ({ issueId, userId }) => {
      await qc.cancelQueries({ queryKey: ["allIssues"] });
      const previous = qc.getQueryData({ queryKey: ["allIssues"] });

      qc.setQueryData({ queryKey: ["allIssues"] }, (old = []) =>
        old.map((it) => {
          if ((it.id || it._id) !== issueId) return it;
          const upvoters = Array.isArray(it.upvoters) ? [...it.upvoters] : [];
          if (!upvoters.includes(userId)) upvoters.push(userId);
          return { ...it, upvoters, upvotes: upvoters.length };
        })
      );

      qc.setQueryData({ queryKey: ["issue", issueId] }, (old) => {
        if (!old) return old;
        const upvoters = Array.isArray(old.upvoters) ? [...old.upvoters] : [];
        if (!upvoters.includes(userId)) upvoters.push(userId);
        return { ...old, upvoters, upvotes: upvoters.length };
      });

      return { previous };
    },
    onError: (err, vars, context) => {
      if (context?.previous) qc.setQueryData({ queryKey: ["allIssues"] }, context.previous);
    },
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: ["allIssues"] });
      qc.invalidateQueries({ queryKey: ["issue", vars.issueId] });
    },
  });
}
