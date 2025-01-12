<script>
    import { Card, P, Heading } from 'svelte-5-ui-lib';
    let { name, id, status, description, link, dateCreated, dateDue } = $props();

    let bgColor = $state(getBackgroundColor(status));
    let hoverColor = $state(getHoverColor(status));

    function getBackgroundColor(status) {
        return status === 'completed' ? 'bg-moss_green' :
               status === 'registered' ? 'bg-thistle' :
               status === 'overdue' ? 'bg-redwood' :
               'bg-amber';
    }

    function getHoverColor(status) {
        return status === 'completed' ? 'hover:bg-moss_green-400' :
               status === 'registered' ? 'hover:bg-thistle-400' :
               status === 'overdue' ? 'hover:bg-redwood-400' :
               'hover:bg-amber-400';
    }
</script>

<Card 
    href={link} 
    padding="none" 
    size="lg" 
    class="flex flex-col {bgColor} {hoverColor} mb-3 max-w-none border border-ebony-200 rounded-lg cursor-pointer"
>
    <div class="p-4">
        <div class="flex gap-6">
            <div class="flex items-center justify-center h-8 w-8 min-w-8 rounded-full border border-ebony-200 bg-white">
                {id}
            </div>
            
            <div class="flex-1">
                <Heading tag="h3" class="text-2xl font-bold mb-1">{name}</Heading>
                <P class="truncate">{description}</P>
            </div>

            <div class="flex flex-col items-end text-sm">
                <P class="m-0">Status: {status}</P>
                <P class="m-0">Created: {dateCreated}</P>
                <P class="m-0">Due: {dateDue}</P>
            </div>
        </div>
    </div>
</Card>