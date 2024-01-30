package main

import "fmt"

// ListNode definition
type ListNode struct {
	Val  int
	Next *ListNode
}

func swapPairs(head *ListNode) *ListNode {
	if head == nil || head.Next == nil {
		return head
	}

	// remainingListHead := head.Next.Next
	fmt.Println(head.Val)
	fmt.Println(1111)
	newHead := head.Next
	newHead.Next = head

	// head.Next = swapPairs(remainingListHead)
	node5 := &ListNode{Val: 4, Next: nil}
	fmt.Println(2222, head.Val)
	head.Next = &ListNode{Val: 7, Next: node5}

	return newHead
}

func main() {
	// Example usage
	node1 := &ListNode{Val: 1, Next: nil}
	node2 := &ListNode{Val: 2, Next: nil}
	node3 := &ListNode{Val: 3, Next: nil}
	node4 := &ListNode{Val: 4, Next: nil}
	node1.Next = node2
	node2.Next = node3
	node3.Next = node4

	result := swapPairs(node1)
	// Print the result to see the swapped pairs
	for result != nil {
		fmt.Println(result.Val)
		result = result.Next
	}
}
