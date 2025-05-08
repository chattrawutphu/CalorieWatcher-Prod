# ModalSheet Usage Guide

## Overview

The `ModalSheet` component is a fullscreen modal dialog built on top of the `BottomSheet` component. It provides a consistent UI experience across the application for all modal dialogs.

## Import

```tsx
import { ModalSheet } from "@/components/ui/modal-sheet";
```

## Basic Usage

```tsx
<ModalSheet
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Modal Title"
>
  <div className="p-4">
    <p>Modal content goes here</p>
  </div>
</ModalSheet>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | required | Controls the visibility of the modal |
| `onClose` | () => void | required | Function called when the modal is closed |
| `title` | string | "" | Title displayed in the modal header |
| `showCloseButton` | boolean | true | Whether to show the close button in the header |
| `contentClass` | string | "" | Additional CSS classes for the content container |
| `children` | ReactNode | required | Content to be displayed inside the modal |

## Examples

### Confirmation Dialog

```tsx
function ConfirmationDialog({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <ModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <div className="p-4 space-y-4">
        <p>{message}</p>
        <div className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </ModalSheet>
  );
}
```

### Form Modal

```tsx
function FormModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({ name: '', email: '' });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };
  
  return (
    <ModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <Input
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            placeholder="Your email"
          />
        </div>
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </ModalSheet>
  );
}
```

### Custom Content Modal

```tsx
function ImageViewerModal({ isOpen, onClose, imageUrl, caption }) {
  return (
    <ModalSheet
      isOpen={isOpen}
      onClose={onClose}
      title={caption}
      contentClass="flex flex-col items-center justify-center"
    >
      <div className="p-4 max-w-full">
        <img
          src={imageUrl}
          alt={caption}
          className="max-w-full max-h-[70vh] rounded-lg"
        />
        <p className="text-center mt-4 text-muted-foreground">{caption}</p>
      </div>
    </ModalSheet>
  );
}
```

## Migration from Custom Modals

To migrate existing custom modals to use `ModalSheet`:

1. Import the `ModalSheet` component
2. Replace your custom modal JSX with `ModalSheet`
3. Move the modal content to be children of `ModalSheet`
4. Set appropriate props for `isOpen`, `onClose`, and `title`

### Before:

```tsx
{isModalOpen && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-background p-6 rounded-xl shadow-xl w-[90%] max-w-md">
      <h3 className="text-xl font-bold mb-4">Modal Title</h3>
      <div>Modal content</div>
      <button onClick={() => setIsModalOpen(false)}>Close</button>
    </div>
  </div>
)}
```

### After:

```tsx
<ModalSheet
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Modal Title"
>
  <div>Modal content</div>
  <button onClick={() => setIsModalOpen(false)}>Close</button>
</ModalSheet>
``` 