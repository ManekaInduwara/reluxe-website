import { useState, useEffect } from 'react'
import { client } from '@/sanity/lib/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Wrench, CheckCircle, AlertTriangle, Loader2, CalendarClock, AlertCircle } from 'lucide-react'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function MaintenanceToggle() {
  const [mode, setMode] = useState(false)
  const [message, setMessage] = useState('')
  const [endTime, setEndTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true)
        const settings = await client.fetch(`*[_type == "siteSettings"][0]{
          maintenanceMode,
          maintenanceMessage,
          estimatedEndTime
        }`)
        
        if (settings) {
          setMode(settings.maintenanceMode || false)
          setMessage(settings.maintenanceMessage || '')
          setEndTime(settings.estimatedEndTime || '')
        }
      } catch (error) {
        toast.error('Failed to fetch settings', {
          description: error.message
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const toggleMaintenance = async () => {
    setIsLoading(true)
    try {
      if (!message.trim() && !mode) {
        throw new Error('Please enter a maintenance message')
      }

      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maintenance: !mode,
          message: message.trim(),
          endTime: !mode ? endTime : null // Clear end time when disabling
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update maintenance mode')
      }

      const result = await response.json()
      setMode(!mode)
      toast.success(`Maintenance mode ${!mode ? 'enabled' : 'disabled'}`, {
        description: !mode ? 'Your site is now in maintenance mode' : 'Your site is now live',
        action: {
          label: 'View',
          onClick: () => window.open('/', '_blank')
        }
      })
    } catch (error) {
      toast.error('Operation failed', {
        description: error.message,
        icon: <AlertCircle className="h-4 w-4" />
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testMaintenance = async () => {
    setIsTesting(true)
    try {
      // Open preview in new tab
      window.open('/?maintenance-preview=true', '_blank')
      toast.info('Maintenance preview opened', {
        description: 'This is only visible to you in this session'
      })
    } catch (error) {
      toast.error('Preview failed', {
        description: error.message
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Card className="border border-gray-700 bg-gray-900/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-yellow-500" />
              Maintenance Mode
            </CardTitle>
            <CardDescription>
              {mode 
                ? 'Your site is currently in maintenance mode' 
                : 'Enable to take your site offline for maintenance'}
            </CardDescription>
          </div>
          <Badge variant={mode ? 'destructive' : 'default'} className="gap-1">
            {mode ? (
              <>
                <AlertTriangle className="h-3 w-3" />
                ACTIVE
              </>
            ) : (
              <>
                <CheckCircle className="h-3 w-3" />
                INACTIVE
              </>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="maintenance-message">
            Maintenance Message
            <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="maintenance-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[120px] bg-gray-800 border-gray-700"
            placeholder="Explain why the site is down and when it will be back..."
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            This message will be shown to visitors when maintenance is active
          </p>
        </div>

        <div className="space-y-3">
          <Label htmlFor="end-time">
            Estimated Completion
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-1 text-muted-foreground cursor-help">(optional)</span>
              </TooltipTrigger>
              <TooltipContent>
                Providing an estimate helps manage user expectations
              </TooltipContent>
            </Tooltip>
          </Label>
          <DateTimePicker
            id="end-time"
            value={endTime}
            onChange={setEndTime}
            className="bg-gray-800 border-gray-700"
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            onClick={toggleMaintenance}
            variant={mode ? 'default' : 'destructive'}
            disabled={isLoading || (!mode && !message.trim())}
            className="gap-2 w-full sm:w-auto"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : mode ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            {mode ? 'Take Site Online' : 'Put Site in Maintenance'}
          </Button>

          {mode && (
            <Button
              variant="outline"
              onClick={testMaintenance}
              disabled={isTesting}
              className="gap-2"
            >
              {isTesting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CalendarClock className="h-4 w-4" />
              )}
              Preview
            </Button>
          )}
        </div>

        <div className="pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <Label htmlFor="advanced-settings">Advanced Settings</Label>
            <Switch
              id="advanced-settings"
              checked={showAdvanced}
              onCheckedChange={setShowAdvanced}
              className="data-[state=checked]:bg-yellow-500"
            />
          </div>

          {showAdvanced && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg space-y-4">
              <div className="space-y-2">
                <Label>Maintenance Page URL</Label>
                <input
                  type="text"
                  defaultValue="/maintenance"
                  className="w-full p-2 text-sm bg-gray-800 border border-gray-700 rounded"
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Customize this in your site configuration
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Allowed IPs</Label>
                <Textarea
                  className="min-h-[60px] bg-gray-800 border-gray-700 text-sm"
                  placeholder="192.168.1.1, 10.0.0.1"
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  These IPs will bypass maintenance mode (configure in .env)
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}