<script>
    import { Card, P, Heading } from 'svelte-5-ui-lib';
    export let name;
    export let id;
    export let status;
    export let description; 
    export let link;
    export let dateCreated;
    export let dateDue;
 </script>
 
 <Card href={link} padding="none" size="lg" class="flex flex-col bg-thistle mb-2 hover:bg-thistle-200 w-full max-w-none">
    <div class="p-4">
        <div class="flex gap-6">
            <div class="flex items-center justify-center h-8 w-8 min-w-8 rounded-full border border-ebony">
                {id}
            </div>
            
            <div class="flex-1">
                <Heading tag="h3" class="text-2xl font-bold mb-1">{name}</Heading>
                <P class="truncate">{description}</P>
            </div>
 
            <div class="flex flex-col items-end text-sm">
                <P class="m-0">Status: <span class={
                    status === 'completed' ? 'text-moss_green-500' :
                    status === 'registered' ? 'text-thistle-500' :
                    status === 'overdue' ? 'text-redwood-500' :
                    'text-ebony-500'
                }>{status}</span></P>
                <P class="m-0">Created: {dateCreated}</P>
                <P class="m-0">Due: {dateDue}</P>
            </div>
        </div>
    </div>
 </Card>