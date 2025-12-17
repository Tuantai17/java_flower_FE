import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ChevronRightIcon,
    ChevronDownIcon,
    FolderIcon,
    FolderOpenIcon,
    PencilIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const CategoryTree = ({
    categories,
    onEdit,
    onDelete,
    selectedId = null
}) => {
    const [expandedIds, setExpandedIds] = useState(new Set());

    const toggleExpand = (id) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const TreeNode = ({ category, level = 0 }) => {
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expandedIds.has(category.id);
        const isSelected = selectedId === category.id;

        return (
            <div>
                <div
                    className={`flex items-center gap-2 py-2.5 px-3 rounded-lg cursor-pointer transition-colors ${isSelected
                            ? 'bg-pink-100 text-pink-700'
                            : 'hover:bg-gray-100'
                        }`}
                    style={{ paddingLeft: `${level * 24 + 12}px` }}
                >
                    {/* Expand/Collapse Button */}
                    {hasChildren ? (
                        <button
                            onClick={() => toggleExpand(category.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                            {isExpanded ? (
                                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                            ) : (
                                <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                            )}
                        </button>
                    ) : (
                        <span className="w-6" />
                    )}

                    {/* Folder Icon */}
                    {isExpanded ? (
                        <FolderOpenIcon className="h-5 w-5 text-amber-500" />
                    ) : (
                        <FolderIcon className="h-5 w-5 text-amber-500" />
                    )}

                    {/* Category Name */}
                    <span className="flex-1 text-sm font-medium text-gray-700">
                        {category.name}
                    </span>

                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 text-xs rounded-full ${category.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                        {category.active ? 'Active' : 'Hidden'}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                            to={`/admin/categories/edit/${category.id}`}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                        >
                            <PencilIcon className="h-4 w-4" />
                        </Link>
                        <button
                            onClick={() => onDelete?.(category.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Children */}
                {hasChildren && isExpanded && (
                    <div className="border-l border-gray-200 ml-6">
                        {category.children.map((child) => (
                            <TreeNode key={child.id} category={child} level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    if (!categories || categories.length === 0) {
        return (
            <div className="text-center py-12">
                <FolderIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Chưa có danh mục nào</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-soft p-4">
            <div className="space-y-1">
                {categories.map((category) => (
                    <div key={category.id} className="group">
                        <TreeNode category={category} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryTree;
